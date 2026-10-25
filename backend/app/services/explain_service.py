"""
AI Trip Assistant text: a plain-language explanation and a negotiation line, in
English, Marathi and Hinglish.

Two paths with the same output shape:
  1. LLM (Groq, Llama 3.3 70B) when GROQ_API_KEY is set.
  2. Offline template when there is no key, or when the LLM call fails.

The LLM only ever receives the numbers the ML model produced. It never sets a price.
"""
import json
import logging
import urllib.request

from app.config import settings

logger = logging.getLogger("fairtrip")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

FACTOR_EN = {
    "distance_km": "trip distance", "hour": "time of day", "city": "city",
    "service_type": "service type", "vehicle_type": "vehicle type",
    "day_of_week": "day of the week", "month": "season",
}
FACTOR_MR = {
    "distance_km": "अंतर", "hour": "वेळ", "city": "शहर", "service_type": "सेवा प्रकार",
    "vehicle_type": "वाहन प्रकार", "day_of_week": "आठवड्याचा दिवस", "month": "महिना",
}
SERVICE_EN = {"Taxi": "taxi", "Auto": "auto-rickshaw"}
SERVICE_MR = {"Taxi": "टॅक्सी", "Auto": "रिक्षा"}
STATUS_EN = {
    "TYPICAL": "This is within the usual range.",
    "ABOVE_TYPICAL": "It is a little above the usual range.",
    "UNUSUALLY_HIGH": "It is well above the usual range.",
}
STATUS_MR = {
    "TYPICAL": "हा दर सामान्य श्रेणीत आहे.",
    "ABOVE_TYPICAL": "हा दर थोडा जास्त आहे.",
    "UNUSUALLY_HIGH": "हा दर खूप जास्त आहे.",
}
NEGOTIATION = {
    "TYPICAL": {"english": "This sounds fair, let's go ahead.", "hinglish": "Theek hai bhaiya, chalo.", "marathi": "ठीक आहे, चला जाऊया."},
    "ABOVE_TYPICAL": {"english": "Bhaiya, can we go by the meter?", "hinglish": "Bhaiya, meter se chalte hain?", "marathi": "मीटरने जाऊया का?"},
    "UNUSUALLY_HIGH": {"english": "That fare seems high. Please use the meter or suggest a fair fare.", "hinglish": "Yeh fare zyada lag raha hai, meter se chalo.", "marathi": "हे भाडे जास्त वाटतंय, मीटरनेच जाऊया."},
}
SYSTEM_PROMPT = (
    "You explain a taxi or auto fare estimate to a tourist. Use ONLY the numbers and facts in the JSON "
    "you receive. Never invent prices, never say the fare is illegal or fraudulent, and say it is an estimate. "
    "Reply with a JSON object with these string keys: english (two short sentences), marathi (two short "
    "sentences in Marathi), negotiation_english, negotiation_hinglish, negotiation_marathi (one polite line "
    "each that the tourist can say to the driver)."
)


def _comparison(q, lo, hi):
    if q < lo:
        return "below", "खाली"
    if q <= hi:
        return "within", "आत"
    return "above", "वर"


def _template(d):
    lo, hi, q = round(d["range_min"]), round(d["range_max"]), round(d["quoted_price"])
    dist = f"{d['distance_km']:g}"
    cmp_en, cmp_mr = _comparison(q, lo, hi)
    factors = [FACTOR_EN.get(f, f) for f in d.get("top_factors", [])]
    factors_mr = [FACTOR_MR.get(f, f) for f in d.get("top_factors", [])]
    status = d["status"]

    en = (f"Your quote of ₹{q} is {cmp_en} the typical range of ₹{lo}–₹{hi} for this {dist} km "
          f"{SERVICE_EN.get(d['service_type'], 'trip').lower()} trip in {d['city']}. {STATUS_EN[status]}")
    if factors:
        en += f" The biggest factors in this estimate were {' and '.join(factors)}."
    en += " This is an estimate, not an official fare."

    mr = (f"या {dist} किमी {SERVICE_MR.get(d['service_type'], '')} प्रवासासाठी ठराविक दर ₹{lo}–₹{hi} आहे. "
          f"तुमचा दर ₹{q} आहे, जो या श्रेणीच्या {cmp_mr} आहे. {STATUS_MR[status]}")
    if factors_mr:
        mr += f" सर्वात जास्त परिणाम करणारे घटक: {', '.join(factors_mr)}."
    mr += " हा अंदाज आहे, निश्चित दर नाही."

    return {
        "english": en,
        "marathi": mr,
        "negotiation": NEGOTIATION[status],
        "source": "template",
        "model": "Offline template (no API key set)",
    }


def _llm(d):
    facts = {
        "city": d["city"],
        "service": SERVICE_EN.get(d["service_type"], d["service_type"]),
        "distance_km": d["distance_km"],
        "your_quote_rs": round(d["quoted_price"]),
        "typical_range_rs": [round(d["range_min"]), round(d["range_max"])],
        "status": d["status"],
        "biggest_factors": [FACTOR_EN.get(f, f) for f in d.get("top_factors", [])],
    }
    body = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(facts, ensure_ascii=False)},
        ],
        "temperature": 0.3,
        "response_format": {"type": "json_object"},
    }
    req = urllib.request.Request(
        GROQ_URL,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "fairtrip/0.1",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        out = json.loads(resp.read().decode("utf-8"))
    parsed = json.loads(out["choices"][0]["message"]["content"])
    keys = ["english", "marathi", "negotiation_english", "negotiation_hinglish", "negotiation_marathi"]
    if not all(isinstance(parsed.get(k), str) and parsed[k].strip() for k in keys):
        raise ValueError("incomplete LLM reply")
    return {
        "english": parsed["english"],
        "marathi": parsed["marathi"],
        "negotiation": {
            "english": parsed["negotiation_english"],
            "hinglish": parsed["negotiation_hinglish"],
            "marathi": parsed["negotiation_marathi"],
        },
        "source": "llm",
        "model": f"Groq · {settings.GROQ_MODEL}",
    }


def explain(d: dict) -> dict:
    if settings.GROQ_API_KEY:
        try:
            return _llm(d)
        except Exception as e:  # network, quota, bad JSON: fall back so the demo never breaks
            logger.warning("LLM explanation failed, using template: %s", type(e).__name__)
    return _template(d)

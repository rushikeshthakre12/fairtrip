"""
Grounded explanation of a price result.

Two generators, same inputs:
  1. TEMPLATE (always available): sentences built from the ML output. Deterministic.
  2. LLM (optional, needs GROQ_API_KEY): an open LLM rewrites the same facts in plain English.

Guardrail for the LLM path: every number in the LLM answer must appear in the facts we
sent. If the LLM invents or changes a number, we discard its answer and use the template.
The LLM never sees a request to produce a price.
"""
import json
import re
import urllib.error
import urllib.request

from app.config import settings

FACTOR_NAMES = {
    "distance_km": "distance",
    "hour": "time of day",
    "service_type": "service type",
    "vehicle_type": "vehicle type",
    "city": "city",
    "day_of_week": "day of the week",
}
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _rupees(v):
    return f"₹{round(v):,}"


def facts_from_result(r: dict) -> dict:
    """Only these fields ever reach the explanation step (and the LLM, if used)."""
    rng = r["estimated_range"]
    top = sorted(r.get("explanation", []), key=lambda e: e.get("importance", 0), reverse=True)[:2]
    return {
        "city": r["city"],
        "service": r["service_type"],
        "distance_km": round(float(r["distance_km"]), 1),
        "quoted_price": round(float(r["quoted_price"])),
        "range_min": round(float(rng["min"])),
        "range_max": round(float(rng["max"])),
        "status": r["status"],
        "confidence": r.get("confidence", "LOW"),
        "top_factors": [FACTOR_NAMES.get(e["factor"], e["factor"]) for e in top],
    }


def template_explanation(f: dict) -> list[str]:
    q, lo, hi = f["quoted_price"], f["range_min"], f["range_max"]
    if f["status"] == "TYPICAL":
        s1 = (f"Your quote of {_rupees(q)} is within the typical range of {_rupees(lo)} to "
              f"{_rupees(hi)} for this {f['service'].lower()} trip in {f['city']}.")
        s3 = "The price looks reasonable, but you can still confirm the fare with the driver before the ride."
    elif f["status"] == "ABOVE_TYPICAL":
        pct = round((q / hi - 1) * 100)
        s1 = (f"Your quote of {_rupees(q)} is about {pct}% above the typical maximum of {_rupees(hi)} "
              f"for this {f['service'].lower()} trip in {f['city']}.")
        s3 = "It is worth asking the driver to explain the fare or to agree on the meter."
    else:
        pct = round((q / hi - 1) * 100)
        s1 = (f"Your quote of {_rupees(q)} is about {pct}% above the typical maximum of {_rupees(hi)} "
              f"for this {f['service'].lower()} trip in {f['city']}.")
        s3 = "Consider asking for the meter or a fare breakdown before you agree."
    factors = f["top_factors"]
    if len(factors) == 2:
        s2 = f"The {factors[0]} and the {factors[1]} contributed most to this estimate."
    elif factors:
        s2 = f"The {factors[0]} contributed most to this estimate."
    else:
        s2 = "The trip details were used to build this estimate."
    s4 = "This is an estimate from available data. It is not the legally correct fare."
    return [s1, s2, s3, s4]


def _numbers(text: str) -> set[int]:
    return {int(n.replace(",", "")) for n in re.findall(r"\d[\d,]*", text)}


def llm_explanation(f: dict) -> list[str] | None:
    """Ask Groq's hosted Llama model to rewrite the facts. Returns None on any failure."""
    if not settings.GROQ_API_KEY:
        return None
    system = (
        "You explain a taxi fare estimate to a tourist in 3 short sentences of plain English. "
        "Use ONLY the numbers and facts given in the JSON. Never invent or change a number. "
        "Never say the price is fraud. Never claim to know the legal fare. "
        "Mention that the top factors contributed to the estimate (do not say they caused it)."
    )
    body = json.dumps({
        "model": settings.GROQ_MODEL,
        "temperature": 0.2,
        "max_tokens": 180,
        "messages": [{"role": "system", "content": system},
                     {"role": "user", "content": json.dumps(f)}],
    }).encode()
    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=body,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                 "User-Agent": "fairtrip/1.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            text = json.loads(resp.read())["choices"][0]["message"]["content"].strip()
    except (urllib.error.URLError, KeyError, ValueError, TimeoutError):
        return None
    # Guardrail: every number the model wrote must be one we actually sent.
    allowed = _numbers(json.dumps(f)) | {int(f["distance_km"]), 0, 1, 2, 3}
    if not _numbers(text) <= allowed:
        return None
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    return sentences[:4] or None

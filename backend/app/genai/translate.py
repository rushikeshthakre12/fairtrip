"""
English -> Marathi.

Path A (optional, real pretrained neural MT): Helsinki-NLP/opus-mt-en-mr (MarianMT, ~300 MB).
   Enabled when the `transformers` + `sentencepiece` packages are installed and
   FAIRTRIP_MT_MODEL is set (default below). Downloaded once, then runs offline.
Path B (always available): a curated Marathi template bank filled with the same numbers.

The Marathi sentences are never allowed to change a price: numbers are inserted from the ML output.
"""
from app.config import settings

_pipe = None
_pipe_failed = False


def _get_pipe():
    global _pipe, _pipe_failed
    if _pipe is not None or _pipe_failed:
        return _pipe
    if not settings.MT_MODEL:
        _pipe_failed = True
        return None
    try:
        from transformers import pipeline  # optional heavy dependency
        _pipe = pipeline("translation", model=settings.MT_MODEL)
    except Exception:
        _pipe_failed = True
    return _pipe


def machine_translate(sentences: list[str]) -> list[str] | None:
    pipe = _get_pipe()
    if pipe is None:
        return None
    try:
        return [out["translation_text"] for out in pipe(sentences, max_length=160)]
    except Exception:
        return None


def marathi_template(f: dict) -> list[str]:
    q, lo, hi = f["quoted_price"], f["range_min"], f["range_max"]
    rq, rl, rh = f"₹{round(q):,}", f"₹{round(lo):,}", f"₹{round(hi):,}"
    status = f["status"]
    if status == "TYPICAL":
        s1 = f"तुमचा दर {rq} सामान्य श्रेणीत आहे. साधारण दर {rl} ते {rh} आहे."
        neg = "हा दर योग्य वाटतो, चला."
    elif status == "ABOVE_TYPICAL":
        s1 = f"तुमचा दर {rq} सामान्य दरापेक्षा जास्त आहे. साधारण दर {rl} ते {rh} आहे."
        neg = "थोडा कमी करता येईल का?"
    else:
        s1 = f"तुमचा दर {rq} सामान्य दरापेक्षा खूप जास्त आहे. साधारण दर {rl} ते {rh} आहे."
        neg = "मीटरने जाऊया का?"
    s2 = "हा केवळ अंदाज आहे, कायदेशीर दर नाही."
    return [s1, s2], neg


def negotiation_line(f: dict, lang: str) -> str:
    if lang == "mr":
        return marathi_template(f)[1]
    return {
        "TYPICAL": "This price looks fair. Shall we go?",
        "ABOVE_TYPICAL": "Could you reduce the fare a little?",
        "UNUSUALLY_HIGH": "Shall we go by meter?",
    }[f["status"]]

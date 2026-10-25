"""
Loads the trained CBOW model and suggests the next words (NumPy only, no training here).
"""
import logging
import re

import numpy as np

from app.config import settings

logger = logging.getLogger("fairtrip")
CONTEXT = 3
START, UNK = "<s>", "<unk>"
_state = {"vocab": None, "index": None, "E": None, "W": None}


def _load():
    try:
        data = np.load(settings.CBOW_PATH, allow_pickle=False)
        vocab = [str(v) for v in data["vocab"]]
        E, W = data["E"], data["W"]
    except (OSError, KeyError, ValueError):
        # Missing, or written by a different CBOW script with another layout.
        logger.warning("CBOW model missing or incompatible at %s - run ml/training/train_cbow.py", settings.CBOW_PATH)
        return False
    _state.update(vocab=vocab, index={w: i for i, w in enumerate(vocab)}, E=E, W=W)
    return True


_loaded = _load()


def is_ready() -> bool:
    return bool(_loaded)


def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z]+", text.lower())


def next_words(text: str, k: int = 3) -> list[str]:
    if not _loaded:
        return []
    raw = text or ""
    tokens = tokenize(raw)
    if raw and raw[-1].isalpha() and tokens:
        tokens = tokens[:-1]  # the last word is still being typed: use the words before it
    ctx = ([START] * CONTEXT + tokens)[-CONTEXT:]
    index = _state["index"]
    ids = [index.get(w, index[UNK]) for w in ctx]
    z = _state["E"][ids].mean(axis=0) @ _state["W"]   # CBOW: average context, score all words
    z[index[START]] = -np.inf
    z[index[UNK]] = -np.inf
    return [_state["vocab"][i] for i in np.argsort(-z)[:k]]

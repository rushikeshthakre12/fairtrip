"""Inference side of the NumPy CBOW model (trained by ml/genai/train_cbow.py)."""
import os
import re
import threading

import numpy as np

from app.config import settings

N_CONTEXT = 3
PAD, UNK, END = "<s>", "<unk>", "</s>"
_lock = threading.Lock()
_model = None


def _load():
    global _model
    if _model is None and os.path.exists(settings.CBOW_PATH):
        data = np.load(settings.CBOW_PATH, allow_pickle=False)
        vocab = [str(w) for w in data["vocab"]]
        _model = {"W_in": data["W_in"], "W_out": data["W_out"], "vocab": vocab,
                  "stoi": {w: i for i, w in enumerate(vocab)}}
    return _model


def is_ready() -> bool:
    return _load() is not None


def _softmax(z):
    z = z - z.max()
    e = np.exp(z)
    return e / e.sum()


def suggest(text: str, k: int = 3):
    """Top-k next words for `text`.

    If the text ends with a space, the last words are complete and we predict the next word.
    If the user is in the middle of a word ("prepa"), we predict the rest of that word
    (only candidates that start with the partial word are kept).
    """
    m = _load()
    if m is None:
        return []
    raw = text.lower()
    words = re.findall(r"[a-z0-9]+", raw)
    partial = ""
    if words and not raw.endswith(" ") and re.search(r"[a-z0-9]$", raw):
        partial = words[-1]
        words = words[:-1]
    ctx_words = ([PAD] * N_CONTEXT + words)[-N_CONTEXT:]
    stoi = m["stoi"]
    ctx = [stoi.get(w, stoi[UNK]) for w in ctx_words]

    with _lock:
        h = m["W_in"][ctx].mean(axis=0)
        probs = _softmax(h @ m["W_out"])

    order = np.argsort(-probs)
    out = []
    for i in order:
        w = m["vocab"][i]
        if w in (PAD, UNK, END) or w.startswith("<"):
            continue
        if partial and not w.startswith(partial):
            continue
        if partial and w == partial:
            continue
        out.append({"word": w, "prob": round(float(probs[i]), 3)})
        if len(out) == k:
            break
    return out

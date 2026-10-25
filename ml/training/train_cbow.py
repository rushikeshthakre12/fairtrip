"""
Train the CBOW next-word model behind FairTrip's community-notes suggestions.

Run from ml/training:   python train_cbow.py
Writes:                 ml/models/cbow.npz  and  ml/models/cbow_metrics.json

CBOW (Continuous Bag of Words) learns word embeddings by predicting a word from
the words around it. Here it uses the 3 previous words (a one-sided window) to
predict the next word. The model is written in plain NumPy so every step is visible.

The corpus is a SMALL SYNTHETIC set of taxi/travel note phrases written for this
prototype. Suggestions are good for taxi-note phrases and weak for general English.
"""
import json
import os
import re
from datetime import datetime, timezone

import numpy as np

CONTEXT = 3        # previous words used to predict the next word
DIM = 24           # embedding size
EPOCHS = 1500
LR = 0.5
SEED = 42
START, UNK = "<s>", "<unk>"

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(HERE, "..", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "cbow.npz")
METRICS_PATH = os.path.join(MODEL_DIR, "cbow_metrics.json")

BASE = [
    "prepaid counter at the airport gave a fixed fare",
    "driver refused to use the meter",
    "driver asked extra for the toll",
    "fare was higher because of night charges",
    "auto wala asked double at the station",
    "app showed a lower fare than the driver quoted",
    "meter was not working so we negotiated the price",
    "paid extra for luggage and waiting time",
    "driver took a longer route to increase the fare",
    "got a fair fare by booking through the app",
    "the rickshaw fare was fixed by the police booth",
    "cab charged surge pricing during the rain",
    "driver agreed to the meter after a short argument",
    "night fare was almost double the usual price",
    "traffic jam increased the fare by a lot",
    "we paid the fixed rate shown at the counter",
    "driver said the fare is fixed for this area",
    "took a taxi from the station to the hotel",
    "auto was cheaper than the taxi for this short trip",
    "the bill included a parking and toll charge",
]
PLACES = ["airport", "railway station", "bus stand", "the hotel", "the market", "night", "rain", "traffic"]


def tokenize(text):
    return re.findall(r"[a-z]+", text.lower())


def build_corpus():
    """Every base sentence plus one variant per place. Each row keeps its base id,
    so the train/test split is by template (no near-copies leak into the test set)."""
    rows = []
    for b, sent in enumerate(BASE):
        rows.append((b, tokenize(sent)))
        for p in PLACES:
            rows.append((b, tokenize(f"{sent} near {p}")))
    return rows


def make_examples(rows, w2i):
    X, Y = [], []
    for _, toks in rows:
        ids = [w2i.get(w, w2i[UNK]) for w in toks]
        padded = [w2i[START]] * CONTEXT + ids
        for i in range(len(ids)):
            X.append(padded[i : i + CONTEXT])
            Y.append(ids[i])
    return np.array(X), np.array(Y)


def softmax_rows(Z):
    Z = Z - Z.max(axis=1, keepdims=True)
    P = np.exp(Z)
    return P / P.sum(axis=1, keepdims=True)


def forward(E, W, X):
    H = E[X].mean(axis=1)            # CBOW step 1: average the context embeddings
    return H, softmax_rows(H @ W)    # CBOW step 2: score every vocabulary word, then softmax


def top_k(E, W, vocab, w2i, text, k=3):
    toks = tokenize(text)
    if text and text[-1].isalpha() and toks:
        toks = toks[:-1]             # last word still being typed: use the words before it
    ctx = ([START] * CONTEXT + toks)[-CONTEXT:]
    ids = [w2i.get(w, w2i[UNK]) for w in ctx]
    z = E[ids].mean(axis=0) @ W
    z[w2i[START]] = -np.inf
    z[w2i[UNK]] = -np.inf
    return [vocab[i] for i in np.argsort(-z)[:k]]


def main():
    rows = build_corpus()
    vocab = [START, UNK] + sorted({w for _, toks in rows for w in toks})
    w2i = {w: i for i, w in enumerate(vocab)}

    # Random 15% hold-out. The phrases share templates, so this is OPTIMISTIC;
    # a strict template split is harder (see README/GENAI docs for the numbers).
    order = np.random.default_rng(SEED).permutation(len(rows))
    cut = int(0.85 * len(rows))
    train_rows = [rows[i] for i in order[:cut]]
    test_rows = [rows[i] for i in order[cut:]]
    Xtr, Ytr = make_examples(train_rows, w2i)
    Xte, Yte = make_examples(test_rows, w2i)
    print(f"corpus: {len(rows)} sentences | vocab: {len(vocab)} words | "
          f"train examples: {len(Ytr)} | held-out examples: {len(Yte)}")

    rng = np.random.default_rng(SEED)
    V = len(vocab)
    E = rng.normal(0, 0.1, (V, DIM))   # input embeddings (the word vectors we keep)
    W = rng.normal(0, 0.1, (DIM, V))   # output weights
    N = len(Ytr)
    idx = np.arange(N)

    losses = []
    for ep in range(EPOCHS):
        H, P = forward(E, W, Xtr)
        loss = -np.log(P[idx, Ytr] + 1e-12).mean()   # cross-entropy
        losses.append(float(loss))
        dZ = P                                        # gradient of softmax + cross-entropy
        dZ[idx, Ytr] -= 1
        dZ /= N
        dW = H.T @ dZ
        dH = dZ @ W.T
        dE = np.zeros_like(E)
        np.add.at(dE, Xtr, np.repeat(dH[:, None, :], CONTEXT, axis=1) / CONTEXT)
        W -= LR * dW                                  # gradient descent step
        E -= LR * dE
        if ep % 200 == 0 or ep == EPOCHS - 1:
            print(f"epoch {ep:4d}   training loss {loss:.4f}")

    _, Pte = forward(E, W, Xte)
    test_nll = -np.log(Pte[np.arange(len(Yte)), Yte] + 1e-12).mean()
    ranks = np.argsort(-Pte, axis=1)
    top1 = float((ranks[:, 0] == Yte).mean())
    top3 = float((ranks[:, :3] == Yte[:, None]).any(axis=1).mean())
    baseline_top1 = float((Yte == np.bincount(Ytr, minlength=V).argmax()).mean())

    os.makedirs(MODEL_DIR, exist_ok=True)
    np.savez(MODEL_PATH, vocab=np.array(vocab), E=E, W=W, losses=np.array(losses))
    metrics = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "model": "CBOW (NumPy), context window 3, embedding dim 24",
        "dataset": "DEMO/PROTOTYPE: small synthetic taxi/travel note corpus",
        "corpus_sentences": len(rows),
        "vocab_size": V,
        "train_examples": int(N),
        "heldout_examples": int(len(Yte)),
        "epochs": EPOCHS,
        "final_train_loss": round(losses[-1], 4),
        "heldout_perplexity": round(float(np.exp(test_nll)), 2),
        "heldout_top1_accuracy": round(top1, 3),
        "heldout_top3_accuracy": round(top3, 3),
        "baseline_most_common_word_top1": round(baseline_top1, 3),
        "split": "random 15% of sentences held out (optimistic: shared templates)",
    }
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print("\nHeld-out results (random 15% of sentences):")
    print(f"  top-1 accuracy : {top1:.1%}   (baseline 'most common word': {baseline_top1:.1%})")
    print(f"  top-3 accuracy : {top3:.1%}")
    print(f"  perplexity     : {np.exp(test_nll):.2f}")
    print("\nSample next-word suggestions:")
    for prefix in ["driver refused to", "prepaid counter at the", "meter was not", "fare was higher because of"]:
        print(f"  '{prefix} ...' -> {top_k(E, W, vocab, w2i, prefix)}")
    print(f"\nSaved {MODEL_PATH}")


if __name__ == "__main__":
    main()

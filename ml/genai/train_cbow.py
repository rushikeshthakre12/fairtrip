"""
CBOW next-word model, written from scratch in NumPy (no deep-learning framework).

Architecture (what the code does, step by step):
  1. Context = the previous N=3 words (padded with <s> at the start of a line).
  2. Each context word id looks up a row of the input embedding matrix W_in (V x D).
  3. The context vectors are AVERAGED into one vector h (this averaging is the "bag" in CBOW).
  4. h is multiplied by the output matrix W_out (D x V) -> one score (logit) per vocabulary word.
  5. Softmax turns the scores into probabilities p(next word | context).
  6. Loss = -log p(true next word)   (cross-entropy).
  7. Backpropagation by hand: gradient of softmax+cross-entropy is (p - one_hot(target)).
     Plain stochastic gradient descent updates W_out and the used rows of W_in.

Run:  python train_cbow.py      -> writes ../models/cbow.npz
"""
import os
import re

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
CORPUS = os.path.join(HERE, "corpus_taxi.txt")
OUT = os.path.join(HERE, "..", "models", "cbow.npz")

N_CONTEXT = 3    # previous words used as context
DIM = 32         # embedding size
EPOCHS = 40
LR = 0.2
BATCH = 64
SEED = 42

PAD, UNK, END = "<s>", "<unk>", "</s>"


def tokenize(line: str):
    return re.findall(r"[a-z0-9]+", line.lower())


def build_vocab(lines):
    words = sorted({w for ln in lines for w in ln})
    vocab = [PAD, UNK, END] + words
    return vocab, {w: i for i, w in enumerate(vocab)}


def make_pairs(lines, stoi):
    xs, ys = [], []
    for toks in lines:
        seq = [PAD] * N_CONTEXT + toks + [END]
        ids = [stoi.get(w, stoi[UNK]) for w in seq]
        for i in range(N_CONTEXT, len(ids)):
            xs.append(ids[i - N_CONTEXT:i])
            ys.append(ids[i])
    return np.array(xs, dtype=np.int64), np.array(ys, dtype=np.int64)


def softmax(z):
    z = z - z.max(axis=1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)


def train():
    rng = np.random.default_rng(SEED)
    with open(CORPUS, encoding="utf-8") as f:
        lines = [tokenize(l) for l in f if tokenize(l)]
    vocab, stoi = build_vocab(lines)
    X, y = make_pairs(lines, stoi)
    V = len(vocab)
    print(f"phrases={len(lines)}  vocab={V}  training pairs={len(X)}")

    W_in = rng.normal(0, 0.1, (V, DIM))
    W_out = rng.normal(0, 0.1, (DIM, V))

    for epoch in range(EPOCHS):
        order = rng.permutation(len(X))
        total = 0.0
        for start in range(0, len(X), BATCH):
            idx = order[start:start + BATCH]
            ctx, tgt = X[idx], y[idx]
            h = W_in[ctx].mean(axis=1)              # (B, D)  averaged context
            probs = softmax(h @ W_out)               # (B, V)
            total += -np.log(probs[np.arange(len(tgt)), tgt] + 1e-12).sum()

            d_logits = probs
            d_logits[np.arange(len(tgt)), tgt] -= 1  # p - one_hot(target)
            d_logits /= len(tgt)

            grad_out = h.T @ d_logits                # (D, V)
            d_h = d_logits @ W_out.T                 # (B, D)
            grad_in = np.zeros_like(W_in)
            np.add.at(grad_in, ctx, (d_h / N_CONTEXT)[:, None, :].repeat(N_CONTEXT, axis=1))

            W_out -= LR * grad_out
            W_in -= LR * grad_in
        if epoch % 5 == 0 or epoch == EPOCHS - 1:
            print(f"epoch {epoch:2d}  avg loss {total / len(X):.3f}  perplexity {np.exp(total / len(X)):.2f}")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    np.savez(OUT, W_in=W_in, W_out=W_out, vocab=np.array(vocab))
    print(f"saved -> {os.path.abspath(OUT)}")


if __name__ == "__main__":
    train()

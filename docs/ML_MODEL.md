# FairTrip — ML Model & Range Methodology

## 1. Model

`RandomForestRegressor` (scikit-learn), wrapped in a scikit-learn `Pipeline`
with a `ColumnTransformer` for preprocessing. This is the entire prediction
path — nothing else influences `predicted_price`.

**Features used:**

| Feature | Type | Encoding |
|---|---|---|
| `city` | categorical | One-Hot |
| `service_type` | categorical | One-Hot |
| `vehicle_type` | categorical (nullable → `"unknown"`) | One-Hot |
| `distance_km` | numeric | passthrough (validated > 0) |
| `hour` | numeric (0–23), derived from trip time | passthrough |
| `day_of_week` | numeric (0=Mon..6=Sun) | passthrough |
| `month` | numeric (1–12) | passthrough |

Target: `price` (₹).

## 2. Training Pipeline (`ml/training/train_model.py`)

1. Load `ml/data/fairtrip_prices.csv` (demo dataset — see DATASET note below)
   + any exported `validated_prices` rows if present.
2. Drop rows failing basic sanity checks (price ≤ 0, distance ≤ 0).
3. Train/test split (80/20, `random_state=42` for reproducibility).
4. Fit `ColumnTransformer(OneHotEncoder) + RandomForestRegressor(n_estimators=300, random_state=42)`.
5. Evaluate on the held-out test split: **MAE**, **RMSE**, **R²**.
6. Compute **residuals** (`y_test - y_pred`) on the test split — these drive
   the range methodology below.
7. Persist:
   - `ml/models/fairtrip_model.pkl` — the fitted pipeline (joblib)
   - `ml/models/metrics.json` — MAE/RMSE/R², residual std, training row count, timestamp
8. The FastAPI backend only ever *loads* these two files. It never trains.

Re-run any time with:
```
python ml/training/train_model.py
```

## 3. Estimated Range Methodology

We do **not** invent a range. The range is derived from the model's own
out-of-sample error on the held-out test set at prediction time:

```
predicted_price = model.predict(features)
residual_std     = std(residuals on held-out test set)   [from metrics.json]

range_min = max(0, predicted_price - 1.0 * residual_std)
range_max = predicted_price + 1.0 * residual_std
```

This uses ±1 residual standard deviation around the point prediction as a
defensible, data-derived uncertainty band — it says "the model's typical
prediction error on data it hadn't seen was about this large," rather than
an arbitrary fixed percentage. As more validated real-world data is added
and the model is retrained, `residual_std` will change (ideally shrink),
and so will the width of the displayed range.

This is explicitly **not** a statistical confidence interval in the formal
sense (residuals aren't assumed normally distributed) — it is disclosed to
the user only as "Estimated Typical Range," never as "confidence interval"
or "guaranteed range."

## 4. Price Status Thresholds (configurable, backend-only)

Defined once in `backend/app/services/pricing_config.py` as
`PRICE_STATUS_CONFIG`, not duplicated in the frontend:

```python
PRICE_STATUS_CONFIG = {
    "above_typical_multiplier": 1.0,     # quote > range_max        → ABOVE_TYPICAL
    "unusually_high_multiplier": 1.5,    # quote > range_max * 1.5  → UNUSUALLY_HIGH
}
```

Logic:
- `quote <= range_max` → **TYPICAL** (includes quotes below range_min — "unusually low" is
  out of scope for v1 but the same mechanism could add it later)
- `range_max < quote <= range_max * 1.5` → **ABOVE_TYPICAL**
- `quote > range_max * 1.5` → **UNUSUALLY_HIGH**

Thresholds are multipliers, not fixed rupee amounts, so they scale sensibly
across cheap short trips and expensive long ones.

## 5. Confidence Scoring

`confidence` reflects how much comparable data backed the estimate, **not**
how "sure" the model is mathematically:

```
n = count of validated + demo training rows matching (city, service_type)

n >= 30   → HIGH
10 <= n < 30 → MEDIUM
n < 10    → LOW
```

Low confidence always renders the caution message in the UI: *"Limited
comparable data is available. Use this estimate as a reference only."*

## 6. Explainability

`RandomForestRegressor.feature_importances_` (global, from the trained
pipeline) is combined with the specific request's feature values to produce
human-readable statements such as:

> "Distance (15 km) — contributed to the estimate. Longer trips generally
> increase expected price."

Wording deliberately uses **"contributed to the estimate" / "was considered
by the model"** — never "caused" — since feature importance is not a causal
claim.

## 7. Dataset Disclosure

`ml/data/fairtrip_prices.csv` is a **synthetic, deterministic, prototype
dataset** (see `ml/data/README.md`), generated with a fixed random seed to
approximate plausible fare patterns across Indian cities. It is explicitly
labeled "Demo/Prototype Dataset" everywhere it surfaces (training script
output, model info API, transparency page). It is designed to be replaced
or augmented by validated community observations without any code changes —
only re-running `train_model.py` against a larger/real CSV or DB export.

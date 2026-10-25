# FairTrip — Presentation Guide

## 1. The one-minute story
> A tourist lands in an unfamiliar city and a driver says "₹900". The tourist has no way to know
> if that is typical. **FairTrip estimates the typical local price range with a Random Forest model,
> shows where the quote falls, and explains why** — it informs the decision, it does not make it.

**Say this early:** FairTrip is a *decision-support tool*. It is **not** a booking app, **not** a fraud
detector, and it does **not** claim to know the "legally correct" price.

## 2. Numbers to remember (all real, from `ml/models/metrics.json`)
| | |
|---|---|
| Cities / services | 15 cities, Taxi + Auto |
| Places mapped (From/To) | 224 landmarks (approximate coordinates) |
| Training data | 12,000 rows — **synthetic demo dataset** (say so!) |
| Split | 9,600 train / 2,400 held-out test |
| Model | RandomForestRegressor, 300 trees |
| R² (test) | 0.972 |
| MAE / RMSE (test) | ₹52.6 / ₹79.1 |
| Range width | ± 10.2 % of predicted price (relative residual std) |

## 3. ML workflow (built and working)
```
Trip input (city, From→To, time, quote)
  → distance auto-estimated (Haversine × road factor)            [frontend]
  → FastAPI validates input (Pydantic)                            [backend]
  → features: city, service, vehicle, distance, hour, weekday, month
  → one-hot encoding + RandomForestRegressor → predicted price    [ML]
  → range = predicted ± 1 relative residual std (from test data)
  → status: ≤ range max → TYPICAL | ≤ 1.5× → ABOVE | else UNUSUALLY HIGH
  → confidence from how many comparable rows exist (HIGH/MED/LOW)
  → feature importance → "why this estimate" list
  → result page + receipt + disclaimer                            [frontend]
```
**Training pipeline (offline):** generate/collect data → clean → train/test split (80/20) →
fit → evaluate (MAE, RMSE, R²) → save `fairtrip_model.pkl` + `metrics.json`. The API only *loads*
the model; it never trains and never hardcodes a price.

**Data-improvement loop:** community report → PENDING → admin validates → VALIDATED →
`validated_prices` → added to training CSV → retrain → better model. Unvetted reports never reach training.

**Honest limitations (say them before they ask):**
* Dataset is **synthetic** (rates are illustrative per city) — production needs real validated fares.
* Distances are estimates (landmark coordinates ≈ ±1 km, straight line × 1.35).
* Beyond the trained distance range (80 km) the app shows a warning.
* The range is the model's own held-out error band, not a legal fare or a statistical confidence interval.

## 4. GenAI workflow (PLANNED — not in the app yet)
> ⚠️ These three features are **designed but not implemented**. Present them as the roadmap,
> or build them before the demo. Do not demo what does not exist.

| Feature | Concept | Where | Flow |
|---|---|---|---|
| Next-word suggestions | **CBOW** word embeddings | Community-report notes box | taxi-phrase corpus → context window (2–3 words) → CBOW predicts target word → top-3 chips |
| English → Marathi | translation model (pretrained or API) | Result page "मराठीत पहा" | ML result text → translate → polite line to show the driver |
| AI explanation | LLM, grounded prompt | Result page | ML output (range, status, factors) → prompt "use only these numbers" → 2–3 plain sentences |

**Key design rule:** GenAI only *rewrites / communicates* what the ML decided. It never produces a price.

## 5. Live-demo script (≈ 4 minutes)
1. **Landing** — hero + live widget: change the city dropdown, drag the sliders → real model responds.
   Point at the stats strip (numbers come live from the API).
2. **Checker** → click a **demo scenario** chip (fills the form) → *Analyze*.
   * `Mumbai · Airport → Andheri` (₹900) → **UNUSUALLY HIGH**   ← the headline story
   * `Mumbai · CST → Bandra` (₹430) → **TYPICAL**
   * `Nagpur · Airport → Sitabuldi` (₹300) → **ABOVE TYPICAL**
   * `Delhi · IGI → Connaught Place` (₹850) → **UNUSUALLY HIGH**
   * `Bengaluru · Airport → MG Road` (₹920) → **TYPICAL**
   * `Goa · Airport → Calangute` (₹1050) → **ABOVE TYPICAL**
3. **Result** — quote vs range bar, status, "why did we estimate this price" (distance is the top factor ≈ 60 %),
   confidence, disclaimer, printable receipt.
4. **Scan & Check** — upload `docs/samples/taxi_rate_card.png` → OCR extracts price → you must confirm before analysis.
5. **Community → Admin** — submit a report (PENDING) → validate in Admin → only now eligible for training.
6. **Transparency** — real MAE / RMSE / R², dataset notice, range methodology.

(Expected statuses above hold for the current model; if you retrain, re-check them.)

## 6. Likely questions
* **Why Random Forest?** Tabular data with mixed categorical/numeric features, non-linear (night surcharge, city effects),
  robust, little tuning, gives feature importances for explainability.
* **How is the range computed?** Predicted price ± one relative residual std measured on held-out data (≈ 10 %).
* **Is R² 0.97 impressive?** It is on *synthetic* data generated from a formula plus noise — it shows the pipeline works,
  not real-world accuracy. Say that.
* **Is it a fraud detector?** No. A high quote is information, not proof of anything.
* **What if a city/trip is unseen?** Confidence drops / out-of-range warning; the model cannot extrapolate.
* **How does it improve?** Validated community fares → retrain.
* **Why verify OCR output?** OCR makes mistakes; the user confirms before any prediction.
* **Feature importance = causation?** No — it shows what the model used, not what causes prices.

## 7. Suggested slides (8)
1 Problem · 2 Solution & what it is NOT · 3 Architecture · 4 Data + model + metrics · 5 Range/status/explainability
· 6 Community + validation loop · 7 Live demo · 8 Limitations + roadmap (GenAI: CBOW, Marathi translation, LLM explanation).

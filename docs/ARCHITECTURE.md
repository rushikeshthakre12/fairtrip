# FairTrip — Architecture

## 1. What FairTrip Is (and Is Not)

FairTrip is a **decision-support / price-intelligence tool**. It estimates a
*typical local price range* for a transport trip and shows the traveler where
their quote falls relative to that range.

It is **not**:
- A booking platform
- A fraud detector
- A system that knows the "correct" or "legal" price

Every surface of the product (UI copy, API responses, docs) must preserve this
distinction. This is enforced structurally: the API never returns a field
called anything like `is_fraud` or `correct_price`, only `predicted_price`,
`estimated_range`, and `status` (a *relative* comparison label).

## 2. High-Level Data Flow

```
User Input (city, service, distance, time, quote)
        │
        ▼
Frontend (React) — validates input shape
        │  POST /api/predict
        ▼
FastAPI Backend
        │  1. Validate & sanitize (Pydantic schemas)
        │  2. Build feature vector (services/feature_builder.py)
        │  3. Load trained pipeline (ml/models/fairtrip_model.pkl)
        │  4. RandomForestRegressor.predict() → predicted_price
        │  5. Range = predicted_price ± f(model residual stats)  (see ML_MODEL.md)
        │  6. Compare quoted_price vs range → status (config-driven thresholds)
        │  7. Confidence = f(#comparable validated observations for city+service)
        │  8. Feature importances → explanation list
        ▼
JSON response (see API.md)
        │
        ▼
Frontend renders: Result screen, comparison bar, explanation, disclaimer
```

## 3. Component Responsibilities

| Layer | Responsibility | Must NOT do |
|---|---|---|
| `frontend/` | Forms, validation UX, rendering results, OCR upload UI, community report form | Contain any pricing/ML logic |
| `backend/app/routes` | HTTP contracts (FastAPI routers) | Contain business logic inline |
| `backend/app/services` | Feature building, price-status logic, confidence scoring, OCR orchestration | Talk to DB directly (use `database/`) |
| `backend/app/database` | SQLAlchemy models + session mgmt for PostgreSQL | — |
| `ml/training` | Reproducible training pipeline: load data → preprocess → train → evaluate → save | Be called at request time (training is offline) |
| `ml/models` | Persisted `fairtrip_model.pkl` (pipeline: encoder + RandomForest) + `metrics.json` | — |

## 4. Why Random Forest (not a hardcoded rule)

A RandomForestRegressor is trained offline on (currently synthetic/demo,
architecturally-ready-for-real) trip observations. At request time the
FastAPI backend loads the **already-trained** pipeline from disk and calls
`.predict()` — no retraining, no hardcoded price tables. See `ML_MODEL.md`
for the exact preprocessing + range + confidence methodology.

## 5. Data Improvement Loop

```
Public/reference data + Community reports + Optional evidence photo
        │
        ▼
   Validation (status: PENDING → VALIDATED / REJECTED)
        │
        ▼
   validated_prices table  ── only VALIDATED rows are eligible
        │
        ▼
   Training dataset (ml/data/) ── merges demo CSV + validated exports
        │
        ▼
   ml/training/train_model.py ── retrain → new fairtrip_model.pkl + metrics.json
        │
        ▼
   Better predictions + more accurate confidence scoring
```

Community submissions are **never** auto-trusted. Only rows with
`status = VALIDATED` in `price_reports` are exported into the training set.

## 6. Extensibility

`service_type` is a first-class categorical feature (not a hardcoded branch),
so adding "Auto/Rickshaw" is a matter of adding rows to the dataset — no code
changes needed for the ML path. Hotels/restaurants/etc. (Future Scope) would
need their own feature schema and are intentionally out of scope now; the
`services` and `cities` tables and `/api/services`, `/api/cities` endpoints
exist so the frontend can grow into multi-service without a rewrite.

## 7. Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + Axios + Recharts (comparison bar)
- **Backend**: FastAPI + Pydantic + SQLAlchemy + Uvicorn
- **ML**: scikit-learn (RandomForestRegressor + ColumnTransformer/OneHotEncoder), pandas, joblib
- **DB**: PostgreSQL (docker-compose for local dev)
- **OCR**: `pytesseract` + `Pillow` (Tesseract OCR engine)
- **Infra**: Docker Compose for local orchestration (db + backend + frontend)

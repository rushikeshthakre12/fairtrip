# FairTrip — Setup Guide

## Option A: Docker Compose (recommended)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:8000/docs
- Postgres: localhost:5432

The database schema (`backend/app/database/schema.sql`) is applied
automatically on first container start via Postgres's init-scripts mechanism.

You still need to train the model once (see below) before `/api/predict`
will work, since `ml/models/` is not pre-populated.

## Option B: Run locally without Docker

### 1. PostgreSQL
Install PostgreSQL 16 locally, then:
```bash
sudo -u postgres psql -c "CREATE USER fairtrip WITH PASSWORD 'fairtrip_dev_pw';"
sudo -u postgres psql -c "CREATE DATABASE fairtrip OWNER fairtrip;"
psql -h localhost -U fairtrip -d fairtrip -f backend/app/database/schema.sql
```

### 2. Environment
```bash
cp .env.example .env
# edit .env if your DB credentials differ
```

### 3. Train the ML model
```bash
cd ml/data
python generate_dataset.py        # regenerate the demo dataset (optional, deterministic)
cd ../training
pip install -r ../../backend/requirements.txt
python train_model.py
```
This produces `ml/models/fairtrip_model.pkl` and `ml/models/metrics.json`.
**The backend will not start serving valid predictions until this step has run.**

### 4. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Visit http://localhost:8000/docs to confirm it's running, and
http://localhost:8000/api/health to check DB + model status.

### 5. Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit http://localhost:5173.

### 6. OCR support (Scan & Check)
Requires the Tesseract OCR engine installed on the machine running the backend:
```bash
sudo apt-get install tesseract-ocr   # Debian/Ubuntu
```

## Retraining with real / validated data

1. Approve community reports via `POST /api/community-reports/{id}/validate?decision=VALIDATED`
   (or the Admin page).
2. Export `validated_prices` to CSV (or extend `ml/training/train_model.py`
   to read directly from Postgres).
3. Merge with or replace `ml/data/fairtrip_prices.csv`.
4. Re-run `python ml/training/train_model.py`.
5. Restart the backend to pick up the new `fairtrip_model.pkl` / `metrics.json`.

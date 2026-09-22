"""
FairTrip — Model Training Pipeline
=====================================
Trains a RandomForestRegressor to predict a "typical" transport price from
trip features. Saves the fitted pipeline + evaluation metrics to ml/models/.

This script is the ONLY place the model is trained. The FastAPI backend
only loads the artifacts this script produces — it never trains at request
time.

Run:
    python train_model.py
"""
import json
import os
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "fairtrip_prices.csv")
MODEL_DIR = os.path.join(BASE_DIR, "..", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "fairtrip_model.pkl")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.json")

CATEGORICAL_FEATURES = ["city", "service_type", "vehicle_type"]
NUMERIC_FEATURES = ["distance_km", "hour", "day_of_week", "month"]
TARGET = "price"

RANDOM_STATE = 42


def load_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)

    # Basic sanity validation (never train on garbage rows)
    df = df[(df["price"] > 0) & (df["distance_km"] > 0)]
    df["vehicle_type"] = df["vehicle_type"].fillna("unknown")
    df = df.dropna(subset=CATEGORICAL_FEATURES + NUMERIC_FEATURES + [TARGET])
    return df.reset_index(drop=True)


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ],
        remainder="passthrough",  # numeric features pass through unchanged
    )

    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=None,
        min_samples_leaf=2,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )

    return Pipeline(steps=[("preprocess", preprocessor), ("model", model)])


def main():
    print("Loading dataset...")
    df = load_data()
    print(f"  {len(df)} usable rows after validation")

    feature_cols = CATEGORICAL_FEATURES + NUMERIC_FEATURES
    X = df[feature_cols]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE
    )

    print("Training RandomForestRegressor...")
    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    print("Evaluating on held-out test split...")
    y_pred = pipeline.predict(X_test)
    residuals = (y_test.values - y_pred)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = r2_score(y_test, y_pred)
    residual_std = float(np.std(residuals))

    metrics = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset": "ml/data/fairtrip_prices.csv (DEMO/PROTOTYPE — synthetic)",
        "n_train_rows": int(len(X_train)),
        "n_test_rows": int(len(X_test)),
        "mae": round(float(mae), 2),
        "rmse": round(rmse, 2),
        "r2": round(float(r2), 4),
        "residual_std": round(residual_std, 2),
        "features": feature_cols,
        "model": "RandomForestRegressor(n_estimators=300, min_samples_leaf=2, random_state=42)",
        # Per (city, service_type) row counts — drives confidence scoring at request time
        "coverage_counts": (
            df.groupby(["city", "service_type"]).size().to_dict()
        ),
    }
    # JSON can't have tuple keys — flatten
    metrics["coverage_counts"] = {
        f"{city}::{service}": int(count)
        for (city, service), count in df.groupby(["city", "service_type"]).size().items()
    }

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print("\n=== Evaluation Metrics (held-out test set) ===")
    print(f"  MAE          : Rs. {metrics['mae']}")
    print(f"  RMSE         : Rs. {metrics['rmse']}")
    print(f"  R^2          : {metrics['r2']}")
    print(f"  Residual std : Rs. {metrics['residual_std']}  (drives the +/- range width)")
    print(f"\nSaved model   -> {MODEL_PATH}")
    print(f"Saved metrics -> {METRICS_PATH}")


if __name__ == "__main__":
    main()

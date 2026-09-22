"""
Loads the ALREADY-TRAINED RandomForest pipeline + metrics at process startup
and serves predictions. This module never trains a model — see
ml/training/train_model.py for that.
"""
import json
import os

import joblib
import numpy as np
import pandas as pd

from app.config import settings
from app.services.pricing_config import determine_confidence, determine_status

FEATURE_NOTES = {
    "distance_km": "Longer trips generally increase expected price.",
    "city": "Local cost levels and typical fare structures vary by city.",
    "hour": "Time of day (e.g. late night) may influence observed prices.",
    "day_of_week": "Weekday vs. weekend patterns can shift typical fares slightly.",
    "service_type": "Taxi and Auto pricing patterns differ structurally.",
    "vehicle_type": "Vehicle category (e.g. SUV vs hatchback) affects typical fares.",
}

DISCLAIMER = (
    "This is an estimate based on available data. FairTrip does not determine "
    "the legally correct price or prove fraud."
)


class ModelService:
    def __init__(self):
        self.pipeline = None
        self.metrics = None
        self.load()

    def load(self):
        if not os.path.exists(settings.MODEL_PATH):
            raise RuntimeError(
                f"Model file not found at {settings.MODEL_PATH}. "
                "Run `python ml/training/train_model.py` first."
            )
        self.pipeline = joblib.load(settings.MODEL_PATH)
        with open(settings.METRICS_PATH) as f:
            self.metrics = json.load(f)

    @property
    def is_ready(self) -> bool:
        return self.pipeline is not None

    def _feature_row(self, city, service_type, distance_km, hour, day_of_week, month, vehicle_type):
        return pd.DataFrame([{
            "city": city,
            "service_type": service_type,
            "vehicle_type": vehicle_type or "unknown",
            "distance_km": distance_km,
            "hour": hour,
            "day_of_week": day_of_week,
            "month": month,
        }])

    def _feature_importances(self):
        """Global feature_importances_ from the fitted RandomForest, mapped
        back to human-readable feature groups (one-hot columns collapsed)."""
        model = self.pipeline.named_steps["model"]
        preprocessor = self.pipeline.named_steps["preprocess"]

        importances = model.feature_importances_
        cat_encoder = preprocessor.named_transformers_["cat"]
        cat_feature_names = list(cat_encoder.get_feature_names_out(["city", "service_type", "vehicle_type"]))
        numeric_feature_names = ["distance_km", "hour", "day_of_week", "month"]
        all_names = cat_feature_names + numeric_feature_names

        grouped = {"city": 0.0, "service_type": 0.0, "vehicle_type": 0.0,
                   "distance_km": 0.0, "hour": 0.0, "day_of_week": 0.0, "month": 0.0}
        for name, importance in zip(all_names, importances):
            if name.startswith("city_"):
                grouped["city"] += importance
            elif name.startswith("service_type_"):
                grouped["service_type"] += importance
            elif name.startswith("vehicle_type_"):
                grouped["vehicle_type"] += importance
            else:
                grouped[name] += importance
        return grouped

    def _coverage_count(self, city: str, service_type: str) -> int:
        key = f"{city}::{service_type}"
        return self.metrics.get("coverage_counts", {}).get(key, 0)

    def predict(self, city, service_type, distance_km, hour, day_of_week, month, vehicle_type, quoted_price):
        row = self._feature_row(city, service_type, distance_km, hour, day_of_week, month, vehicle_type)
        predicted_price = float(self.pipeline.predict(row)[0])

        residual_std = self.metrics["residual_std"]
        range_min = max(0.0, predicted_price - residual_std)
        range_max = predicted_price + residual_std

        status = determine_status(quoted_price, range_max)

        n_obs = self._coverage_count(city, service_type)
        confidence = determine_confidence(n_obs)

        importances = self._feature_importances()
        explanation = []
        for factor, value in [
            ("distance_km", f"{distance_km} km"),
            ("city", city),
            ("hour", f"{hour}:00"),
            ("day_of_week", str(day_of_week)),
            ("service_type", service_type),
            ("vehicle_type", vehicle_type or "unspecified"),
        ]:
            explanation.append({
                "factor": factor,
                "value": value,
                "note": f"{FEATURE_NOTES.get(factor, 'Considered by the model.')} (contributed to the estimate)",
                "importance": round(float(importances.get(factor, 0.0)), 4),
            })
        explanation.sort(key=lambda x: x["importance"], reverse=True)

        return {
            "predicted_price": round(predicted_price, 2),
            "range_min": round(range_min, 2),
            "range_max": round(range_max, 2),
            "status": status,
            "confidence": confidence,
            "explanation": explanation,
            "disclaimer": DISCLAIMER,
            "dataset_notice": self.metrics.get("dataset", "Demo/Prototype dataset"),
            "n_observations": n_obs,
        }


model_service = ModelService()

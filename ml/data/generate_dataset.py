"""
FairTrip — Demo/Prototype Dataset Generator
=============================================
Generates ml/data/fairtrip_prices.csv — a SYNTHETIC, DETERMINISTIC dataset
used only to train a functioning prototype model. This is NOT real-world
collected data. It approximates plausible fare structures (base fare +
per-km rate + time-of-day/night surcharge + small per-city/vehicle variation
+ noise) for demonstration purposes only.

For production, this file should be replaced/augmented by exports from the
`validated_prices` table (real, validated community + reference observations).

Run:
    python generate_dataset.py
"""
import csv
import random

random.seed(42)  # reproducibility

CITIES = ["Mumbai", "Nagpur", "Delhi", "Bengaluru", "Pune", "Jaipur", "Goa"]
SERVICES = ["Taxi", "Auto"]
VEHICLE_TYPES = {
    "Taxi": ["Sedan", "Hatchback", "SUV"],
    "Auto": ["Standard"],
}

# Approximate base fare + per-km rate per city (₹) — illustrative only,
# loosely reflecting relative cost-of-living/fare differences across cities.
CITY_PROFILE = {
    "Mumbai":    {"base": 60, "per_km": 22, "night_surcharge": 1.20},
    "Delhi":     {"base": 55, "per_km": 20, "night_surcharge": 1.25},
    "Bengaluru": {"base": 65, "per_km": 24, "night_surcharge": 1.15},
    "Pune":      {"base": 50, "per_km": 18, "night_surcharge": 1.15},
    "Nagpur":    {"base": 40, "per_km": 15, "night_surcharge": 1.10},
    "Jaipur":    {"base": 45, "per_km": 16, "night_surcharge": 1.10},
    "Goa":       {"base": 70, "per_km": 25, "night_surcharge": 1.30},
}

SERVICE_MULTIPLIER = {"Taxi": 1.0, "Auto": 0.6}
VEHICLE_MULTIPLIER = {"Sedan": 1.0, "Hatchback": 0.9, "SUV": 1.35, "Standard": 1.0}

N_ROWS = 4000


def simulate_price(city, service, distance_km, hour, day_of_week, vehicle_type):
    profile = CITY_PROFILE[city]
    price = profile["base"] + profile["per_km"] * distance_km
    price *= SERVICE_MULTIPLIER[service]
    price *= VEHICLE_MULTIPLIER[vehicle_type]

    # Night surcharge: 10 PM - 5 AM
    if hour >= 22 or hour < 5:
        price *= profile["night_surcharge"]

    # Mild weekend surcharge
    if day_of_week in (5, 6):
        price *= 1.05

    # Random noise to mimic real-world variance (+/- ~12%)
    noise = random.uniform(0.88, 1.12)
    price *= noise

    return round(max(price, 30), 2)  # floor fare


def main():
    rows = []
    for _ in range(N_ROWS):
        city = random.choice(CITIES)
        service = random.choice(SERVICES)
        vehicle_type = random.choice(VEHICLE_TYPES[service])
        distance_km = round(random.uniform(1, 40), 2)
        hour = random.randint(0, 23)
        day_of_week = random.randint(0, 6)
        month = random.randint(1, 12)

        price = simulate_price(city, service, distance_km, hour, day_of_week, vehicle_type)

        rows.append({
            "city": city,
            "service_type": service,
            "distance_km": distance_km,
            "hour": hour,
            "day_of_week": day_of_week,
            "month": month,
            "vehicle_type": vehicle_type,
            "price": price,
        })

    fieldnames = ["city", "service_type", "distance_km", "hour", "day_of_week", "month", "vehicle_type", "price"]
    with open("fairtrip_prices.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {len(rows)} synthetic rows -> fairtrip_prices.csv")


if __name__ == "__main__":
    main()

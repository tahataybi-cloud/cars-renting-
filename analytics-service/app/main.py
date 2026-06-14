from datetime import date
from typing import Any

import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.ensemble import RandomForestRegressor

app = FastAPI(title="SmartRent Morocco Analytics", version="0.1.0")


class DemandSample(BaseModel):
    month: int
    fleet_size: int
    marketing_spend: float
    reservations: int


class DemandRequest(BaseModel):
    samples: list[DemandSample]
    forecast_month: int
    fleet_size: int
    marketing_spend: float


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict/demand")
def predict_demand(request: DemandRequest) -> dict[str, Any]:
    frame = pd.DataFrame([sample.model_dump() for sample in request.samples])
    if len(frame) < 4:
        return {"prediction": None, "confidence": "low", "message": "At least 4 samples are required"}

    x = frame[["month", "fleet_size", "marketing_spend"]]
    y = frame["reservations"]
    model = RandomForestRegressor(n_estimators=80, random_state=42)
    model.fit(x, y)
    prediction = model.predict(pd.DataFrame([{
        "month": request.forecast_month,
        "fleet_size": request.fleet_size,
        "marketing_spend": request.marketing_spend,
    }]))[0]
    return {"prediction": round(float(prediction), 2), "confidence": "medium"}


@app.get("/insights/demo")
def demo_insights() -> dict[str, Any]:
    return {
        "generated_at": date.today().isoformat(),
        "most_profitable_vehicle": "Dacia Duster",
        "high_season_periods": ["June", "July", "August", "December"],
        "maintenance_risk": [{"vehicle": "Renault Clio", "risk": "high", "reason": "Mileage and repair frequency"}],
        "customer_retention": {"risk_segment": "one-time renters", "recommended_action": "loyalty points campaign"},
    }


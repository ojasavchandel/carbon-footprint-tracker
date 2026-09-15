from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import engine, SessionLocal, Base
import models, schemas
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CarbonTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

EMISSION_FACTORS = {
    "Car travel": {"factor": 0.20, "unit": "km"},
    "Bus travel": {"factor": 0.08, "unit": "km"},
    "Flight": {"factor": 0.25, "unit": "km"},
    "Electricity": {"factor": 0.80, "unit": "kWh"},
    "Vegetarian meal": {"factor": 0.5, "unit": "meals"},
    "Non-vegetarian meal": {"factor": 2.0, "unit": "meals"},
}

@app.get("/api/activities", response_model=List[schemas.ActivityResponse])
def get_activities(db: Session = Depends(get_db)):
    return db.query(models.Activity).order_by(models.Activity.date.desc(), models.Activity.created_at.desc()).all()

@app.post("/api/activities", response_model=schemas.ActivityResponse)
def create_activity(activity: schemas.ActivityCreate, db: Session = Depends(get_db)):
    if activity.type not in EMISSION_FACTORS:
        raise HTTPException(status_code=400, detail="Invalid activity type")
    
    if activity.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    factor_info = EMISSION_FACTORS[activity.type]
    co2_kg = activity.quantity * factor_info["factor"]
    
    db_activity = models.Activity(
        type=activity.type,
        quantity=activity.quantity,
        unit=factor_info["unit"],
        emission_factor=factor_info["factor"],
        co2_kg=co2_kg,
        date=activity.date
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@app.delete("/api/activities/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(activity)
    db.commit()
    return {"message": "Activity deleted"}

@app.get("/api/settings", response_model=schemas.SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings(weekly_target_kg=50.0)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@app.put("/api/settings/weekly-target", response_model=schemas.SettingsResponse)
def update_weekly_target(target: schemas.SettingsBase, db: Session = Depends(get_db)):
    if target.weekly_target_kg <= 0:
        raise HTTPException(status_code=400, detail="Target must be positive")
    
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings(weekly_target_kg=target.weekly_target_kg)
        db.add(settings)
    else:
        settings.weekly_target_kg = target.weekly_target_kg
    
    db.commit()
    db.refresh(settings)
    return settings

from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional

class ActivityBase(BaseModel):
    type: str
    quantity: float
    date: date

class ActivityCreate(ActivityBase):
    pass

class ActivityResponse(ActivityBase):
    id: int
    unit: str
    emission_factor: float
    co2_kg: float
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SettingsBase(BaseModel):
    weekly_target_kg: float

class SettingsResponse(SettingsBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

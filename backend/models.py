from sqlalchemy import Column, Integer, String, Float, DateTime, Date
from database import Base
import datetime

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)
    quantity = Column(Float)
    unit = Column(String)
    emission_factor = Column(Float)
    co2_kg = Column(Float)
    date = Column(Date, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Settings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    weekly_target_kg = Column(Float, default=50.0)

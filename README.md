## Hackathon ID

AZIS-7CJHDT

## Website live link

https://frontend-cjgod6jqa-chandelojasav-stars-projects.vercel.app

# CarbonTrack

CarbonTrack is a production-quality, modern web application that allows users to seamlessly track and manage their carbon footprint. It features an intuitive, calm interface, real-time CO₂ calculations, and comprehensive activity history to help individuals make environmentally conscious decisions.

## Features

1. **Log an Activity**: Record activities across transport, electricity, and food. Input fields dynamically adjust to the selected activity unit (km, kWh, meals), providing instant CO₂ estimations based on fixed emission factors.
2. **Dashboard**: Prominently view your weekly footprint and track your overall impact. Contains an interactive donut chart breaking down contributions by category (Transport, Electricity, Food).
3. **Weekly Target**: Set a custom weekly CO₂ target (e.g., 50 kg). Visual progress bars intuitively update as activities are logged or deleted, showing you exactly where you stand.
4. **Intelligent Nudging**: Experience a non-judgmental environment. If you exceed your weekly target, you receive an encouraging alert without being blocked from recording further data.
5. **Absurd Input Detection**: Protects against accidental huge data entries by showing a warning for extremely large values, while still giving you the option to explicitly confirm.
6. **Robust History & Filter**: A dedicated history page allows reviewing all logged activities, with functional filters by activity type and date (Today, This Week, All Dates).

## Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS v4, Recharts, React Router DOM, date-fns
- **Backend**: Python, FastAPI, SQLAlchemy, Pydantic
- **Database**: SQLite (local persistence)
- **Styling**: Custom modern design utilizing a refined, environmental color palette

## CO₂ Factors

The application strictly utilizes the following fixed emission factors for calculations:
- **Car travel**: 0.20 kg CO₂ / km
- **Bus travel**: 0.08 kg CO₂ / km
- **Flight**: 0.25 kg CO₂ / km
- **Electricity**: 0.80 kg CO₂ / kWh
- **Vegetarian meal**: 0.5 kg CO₂ / meal
- **Non-vegetarian meal**: 2.0 kg CO₂ / meal

## Decision Points

For architectural and product logic decisions (The Nudge, Absurd Input, and The Week), see [DECISIONS.md](./DECISIONS.md).

## Running Locally

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### 1. Start the Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
The API will run at http://localhost:8000.

### 2. Start the Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at http://localhost:5173.

## API Documentation

The backend utilizes standard REST conventions, natively documented via FastAPI:
- `GET /api/activities` - Fetch all activities
- `POST /api/activities` - Log a new activity
- `DELETE /api/activities/{id}` - Delete an activity
- `GET /api/settings` - Fetch settings (weekly target)
- `PUT /api/settings/weekly-target` - Update weekly target

Interactive API docs (Swagger UI) are available at `http://localhost:8000/docs` while the backend is running.

## Test Credentials

**Authentication is not required.** This application is designed for frictionless access out-of-the-box. 

## Standard API

No standard external API was provided by the challenge environment. As a result, a custom REST API (FastAPI) was built to power this application completely, ensuring robust data persistence and satisfying all criteria. 

## Hackathon ID

AZIS-7CJHDT

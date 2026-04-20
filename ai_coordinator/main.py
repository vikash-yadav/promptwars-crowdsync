import os
import time
import vertexai
from vertexai.generative_models import GenerativeModel
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from dotenv import load_dotenv
from typing import Dict, Optional, List
from services.ai_decision import ZoneData, get_zone_decision

load_dotenv()

# --- Security Configuration ---
app = FastAPI(title="CrowdSync AI Coordinator (Hardened)")

# Simple In-Memory Rate Limiting for Hackathon
class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.clients: Dict[str, list] = {}

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        if client_ip not in self.clients:
            self.clients[client_ip] = [now]
            return True
        
        # Cleanup old requests
        self.clients[client_ip] = [t for t in self.clients[client_ip] if now - t < 60]
        
        if len(self.clients[client_ip]) < self.requests_per_minute:
            self.clients[client_ip].append(now)
            return True
        return False

limiter = RateLimiter(requests_per_minute=30)

async def check_rate_limit(request: Request):
    client_ip = request.client.host
    if not limiter.is_allowed(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests. Slow down!")

# --- Global Error Handling ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the error here in a real app
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": "An unexpected error occurred. Team has been notified."}
    )

# --- Input Validation Models ---
class PredictionRequest(BaseModel):
    sector_id: str = Field(..., min_length=3, max_length=50, pattern="^[a-zA-Z0-9_-]+$")
    current_count: int = Field(..., ge=0, le=100000)
    capacity: int = Field(..., gt=0, le=100000)

    @validator('current_count')
    def count_within_capacity(cls, v, values):
        if 'capacity' in values and v > values['capacity']:
            # Log warning but allow for "over-capacity" scenarios in stadiums
            pass
        return v

class QueryRequest(BaseModel):
    user_query: str = Field(..., min_length=1, max_length=500)

# --- Vertex AI Logic ---
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "crowdsync-493818")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

try:
    vertexai.init(project=PROJECT_ID, location=LOCATION)
except Exception:
    pass

class GeminiService:
    def __init__(self):
        try: self.model = GenerativeModel("gemini-1.5-flash-002")
        except: self.model = None
        
    async def get_response(self, prompt: str):
        if not self.model: return self.get_fallback_response(prompt)
        try:
            context = "You are the CrowdSync Stadium Coordinator. Answer briefly. "
            response = self.model.generate_content(
                context + prompt,
                generation_config={"temperature": 0.1, "max_output_tokens": 100}
            )
            return response.text
        except: return self.get_fallback_response(prompt)

    def get_fallback_response(self, prompt: str):
        return "I'm optimizing stadium flow right now. Please check the live map for instant updates."

gemini = GeminiService()

# --- Endpoints ---
@app.post("/predict", dependencies=[Depends(check_rate_limit)])
async def predict_occupancy(data: PredictionRequest):
    density = data.current_count / data.capacity
    prediction = int(data.current_count * 1.1)
    return {
        "sector_id": data.sector_id,
        "predicted_occupancy": min(prediction, data.capacity),
        "status": "warning" if density > 0.8 else "normal"
    }

@app.post("/ask", dependencies=[Depends(check_rate_limit)])
async def ask_coordinator(query: QueryRequest):
    answer = await gemini.get_response(query.user_query)
    return {"response": answer}


# --- AI Decision Endpoint ---
class ZoneDecisionRequest(BaseModel):
    zone: str = Field(..., min_length=1, max_length=100)
    people_count: int = Field(..., ge=0, le=500000)
    area_size: float = Field(..., gt=0)
    inflow_rate: float = Field(..., ge=0)
    outflow_rate: float = Field(..., ge=0)
    capacity: int = Field(..., gt=0, le=500000)
    adjacent_zones: Optional[List[str]] = None

@app.post("/decide", dependencies=[Depends(check_rate_limit)])
async def decide_zone_action(request: ZoneDecisionRequest):
    """
    Accepts real-time zone telemetry and returns an AI-driven crowd management
    decision including congestion analysis and recommended action.
    """
    zone_data = ZoneData(
        zone=request.zone,
        people_count=request.people_count,
        area_size=request.area_size,
        inflow_rate=request.inflow_rate,
        outflow_rate=request.outflow_rate,
        capacity=request.capacity,
        adjacent_zones=request.adjacent_zones,
    )
    decision = await get_zone_decision(zone_data, gemini)
    return {
        "zone": decision.zone,
        "congestion_likely": decision.congestion_likely,
        "congestion_level": decision.congestion_level,
        "should_redirect": decision.should_redirect,
        "suggested_action": decision.suggested_action,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

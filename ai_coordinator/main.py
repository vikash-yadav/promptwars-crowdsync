import os
import vertexai
from vertexai.generative_models import GenerativeModel
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# 1. Initialize Vertex AI
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "crowdsync-493818")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

try:
    vertexai.init(project=PROJECT_ID, location=LOCATION)
except Exception as e:
    print(f"Vertex AI Init Warning: {e}")

app = FastAPI(title="CrowdSync AI Coordinator (Gemini Powered)")

class PredictionRequest(BaseModel):
    sector_id: str
    current_count: int = Field(..., ge=0)
    capacity: int = Field(..., gt=0)

class QueryRequest(BaseModel):
    user_query: str

class GeminiService:
    def __init__(self):
        try:
            self.model = GenerativeModel("gemini-1.5-flash-002")
        except:
            self.model = None
        
    async def get_response(self, prompt: str):
        if not self.model:
            return self.get_fallback_response(prompt)
            
        try:
            context = "You are the CrowdSync Stadium Coordinator. Answer briefly and professionally. "
            response = self.model.generate_content(
                context + prompt,
                generation_config={"temperature": 0.2, "max_output_tokens": 150}
            )
            return response.text
        except Exception as e:
            print(f"Vertex AI Error: {e}")
            return self.get_fallback_response(prompt)

    def get_fallback_response(self, prompt: str):
        if "emergency" in prompt.lower():
            return "EMERGENCY: Please proceed to the nearest exit marked with green lights."
        return "I'm currently processing high volumes of data. Please check the live dashboard for real-time updates."

gemini = GeminiService()

@app.get("/")
def health_check():
    return {"status": "active", "provider": "VertexAI-Gemini"}

@app.post("/predict")
async def predict_occupancy(data: PredictionRequest):
    density = data.current_count / data.capacity
    prediction = int(data.current_count * 1.2) if density > 0.7 else int(data.current_count * 1.05)
    return {
        "sector_id": data.sector_id,
        "predicted_occupancy": min(prediction, data.capacity),
        "status": "warning" if density > 0.8 else "normal"
    }

@app.get("/route")
async def get_route(source: str, destination: str):
    return {
        "path": [source, "concourse_a", "gate_b", destination],
        "estimated_time_mins": 8
    }

@app.post("/ask")
async def ask_coordinator(query: QueryRequest):
    answer = await gemini.get_response(query.user_query)
    return {"response": answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))

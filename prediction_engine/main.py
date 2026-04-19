import os
import time
import json
import threading
from kafka import KafkaConsumer
import redis
from fastapi import FastAPI
import uvicorn
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CrowdSync - Prediction Engine")

# Configuration from Environment
KAFKA_SERVER = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
TOPIC = os.getenv('TELEMETRY_TOPIC', 'raw-telemetry')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
PREDICTIONS_HASH = os.getenv('PREDICTIONS_HASH', 'predictions')

try:
    r = redis.from_url(REDIS_URL, decode_responses=True)
except Exception as e:
    print(f"Warning: Could not connect to Redis: {e}")
    r = None

# Historical state
history = defaultdict(list)

def calculate_inflow_rate(sector_id, current_count, timestamp):
    history[sector_id].append((timestamp, current_count))
    history[sector_id] = [(t, c) for t, c in history[sector_id] if timestamp - t <= 300]
    if len(history[sector_id]) < 2: return 0
    past_time, past_count = history[sector_id][0]
    delta_time_mins = max(1, (timestamp - past_time) / 60.0)
    return (current_count - past_count) / delta_time_mins

def run_predictions():
    print(f"Starting Prediction Engine (Kafka: {KAFKA_SERVER}, Redis: {REDIS_URL})")
    try:
        consumer = KafkaConsumer(
            TOPIC,
            bootstrap_servers=[KAFKA_SERVER],
            value_deserializer=lambda m: json.loads(m.decode('utf-8', errors='ignore')),
            auto_offset_reset='latest'
        )
        
        for message in consumer:
            data = message.value
            sector_id = data.get('sector_id', 'unknown')
            current = data.get('count', 0)
            capacity = data.get('capacity', 5000)
            sector_type = data.get('type', 'concourse')
            current_time = time.time()
            
            inflow_rate = calculate_inflow_rate(sector_id, current, current_time)
            base_trend = current + (inflow_rate * 15)
            base_density = base_trend / capacity
            
            # Mock surge logic
            multiplier = 1.4 if sector_type in ['restroom', 'concession'] else 1.0
                
            final_density = min(1.0, max(0.0, base_density * multiplier))
            predicted_15m = int(final_density * capacity)
            status = "critical" if final_density >= 0.9 else "warning" if final_density >= 0.75 else "normal"
            
            prediction = {
                "sector_id": sector_id,
                "current": current,
                "predicted_15m": predicted_15m,
                "status": status,
                "timestamp": current_time
            }
            
            if r:
                r.hset(PREDICTIONS_HASH, sector_id, json.dumps(prediction))
                if status == 'critical':
                    alert = {"type": "critical", "message": f"Surge predicted at {sector_id}", "time": current_time}
                    r.lpush("alerts", json.dumps(alert))
                    r.ltrim("alerts", 0, 9)
                    
    except Exception as e:
        print(f"Error in prediction consumer: {e}")

@app.on_event("startup")
def startup_event():
    threading.Thread(target=run_predictions, daemon=True).start()

@app.get("/")
def read_root():
    return {"module": "Prediction Engine", "status": "Running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)

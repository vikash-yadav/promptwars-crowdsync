import os
import time
import json
import threading
from kafka import KafkaConsumer
import redis
from fastapi import FastAPI
import uvicorn
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CrowdSync - Queue Optimization")

# Configuration from Environment
KAFKA_SERVER = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
TOPIC = os.getenv('TELEMETRY_TOPIC', 'raw-telemetry')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
QUEUES_HASH = os.getenv('QUEUES_HASH', 'queues')

try:
    r = redis.from_url(REDIS_URL, decode_responses=True)
except:
    r = None

distances = {'food-grill': 3, 'food-pizza': 6}

def load_balance_queues(queues):
    options = []
    for sector_id, wait_time in queues.items():
        if 'food' in sector_id:
            travel_time = distances.get(sector_id, 5)
            options.append({"stand": sector_id, "wait_time": wait_time, "total_cost": travel_time + wait_time})
    if not options: return
    options.sort(key=lambda x: x['total_cost'])
    best = options[0]
    rec = {"action": "route", "stand": best['stand'], "message": f"Go to {best['stand']}"} if best['wait_time'] <= 20 else {"action": "order", "message": "Order to seat."}
    if r: r.set("user_recommendation_food", json.dumps(rec))

def run_queue_optimization():
    print(f"Starting Queue Optimization (Kafka: {KAFKA_SERVER}, Redis: {REDIS_URL})")
    try:
        consumer = KafkaConsumer(TOPIC, bootstrap_servers=[KAFKA_SERVER], value_deserializer=lambda m: json.loads(m.decode('utf-8', errors='ignore')))
        current_queues = {}
        for message in consumer:
            data = message.value
            sector_id = data.get('sector_id', 'unknown')
            stype = data.get('type', 'concourse')
            current = data.get('count', 0)
            if stype in ['restroom', 'concession']:
                wait_time = max(0, int(current / (5 if stype == 'concession' else 10)))
                current_queues[sector_id] = wait_time
                if r:
                    r.hset(QUEUES_HASH, sector_id, json.dumps({"sector_id": sector_id, "wait_time_mins": wait_time, "timestamp": time.time()}))
                if stype == 'concession': load_balance_queues(current_queues)
    except Exception as e: print(f"Error in queue consumer: {e}")

@app.on_event("startup")
def startup_event():
    threading.Thread(target=run_queue_optimization, daemon=True).start()

@app.get("/")
def read_root():
    return {"module": "Queue Optimization", "status": "Running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004)

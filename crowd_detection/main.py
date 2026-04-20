import os
import json
import time
import random
import threading
from fastapi import FastAPI
from kafka import KafkaProducer
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configuration from Environment
KAFKA_SERVER = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
TOPIC = os.getenv('TELEMETRY_TOPIC', 'raw-telemetry')
INTERVAL = float(os.getenv('SIMULATION_INTERVAL', 1.0))

# Mock Sensors
SENSORS = ['cam-gate-north', 'cam-gate-south', 'sensor-concourse-101', 'sensor-grill-line']

@app.get("/")
def health_check():
    return {"status": "ingestion_active", "kafka_server": KAFKA_SERVER}

def run_simulation():
    print(f"Starting Crowd Detection Ingestion (Kafka: {KAFKA_SERVER})")
    producer = None
    try:
        producer = KafkaProducer(
            bootstrap_servers=[KAFKA_SERVER],
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
    except Exception as e:
        print(f"Warning: Kafka not available ({e}). Simulation running in dry-run mode.")

    while True:
        data = {
            "sensor_id": random.choice(SENSORS),
            "timestamp": time.time(),
            "count": random.randint(10, 200),
            "inflow_rate": random.uniform(0.5, 5.0)
        }
        
        if producer:
            try:
                producer.send(TOPIC, data)
            except:
                pass
        else:
            # print(f"[DRY-RUN] Telemetry: {data}")
            pass
            
        time.sleep(INTERVAL)

# Start simulation in a background thread
thread = threading.Thread(target=run_simulation, daemon=True)
thread.start()

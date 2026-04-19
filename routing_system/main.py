import os
import time
import json
import threading
from kafka import KafkaConsumer
import redis
import networkx as nx
from fastapi import FastAPI
import uvicorn
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CrowdSync - Routing System")

# Configuration from Environment
KAFKA_SERVER = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
TOPIC = os.getenv('TELEMETRY_TOPIC', 'raw-telemetry')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
ROUTING_INTERVAL = float(os.getenv('ROUTING_INTERVAL', 5.0))

try:
    r = redis.from_url(REDIS_URL, decode_responses=True)
except:
    r = None

# Initialize the stadium graph
stadium_graph = nx.Graph()
stadium_graph.add_edge('entrance', 'sec-north', base_dist=100)
stadium_graph.add_edge('entrance', 'sec-south', base_dist=120)
stadium_graph.add_edge('sec-north', 'sec-east', base_dist=80)
stadium_graph.add_edge('sec-south', 'sec-west', base_dist=90)
stadium_graph.add_edge('sec-east', 'food-grill', base_dist=50)
stadium_graph.add_edge('sec-west', 'food-grill', base_dist=150)
stadium_graph.add_edge('sec-north', 'sec-south', base_dist=40)

for u, v, attrs in stadium_graph.edges(data=True):
    stadium_graph[u][v]['weight'] = attrs['base_dist']

previous_routes = {}

def calculate_optimal_routes():
    try:
        path = nx.shortest_path(stadium_graph, source='entrance', target='food-grill', weight='weight')
        path_cost = nx.shortest_path_length(stadium_graph, source='entrance', target='food-grill', weight='weight')
        route_key = "entrance_to_food"
        
        update_route = False
        if route_key not in previous_routes:
            update_route = True
        else:
            prev_cost = previous_routes[route_key]['cost']
            if path != previous_routes[route_key]['path'] and (prev_cost - path_cost > 20):
                update_route = True
                
        if update_route:
            previous_routes[route_key] = {'path': path, 'cost': path_cost}
            if r:
                route_data = {"destination": "food-grill", "optimal_path": path, "cost": path_cost, "timestamp": time.time()}
                r.set(f"route_{route_key}", json.dumps(route_data))
                alert = {"type": "info", "message": f"Optimal route updated: {path[1]}", "time": time.time()}
                r.lpush("alerts", json.dumps(alert))
                r.ltrim("alerts", 0, 9)
    except Exception: pass

def run_routing():
    print(f"Starting Routing System (Kafka: {KAFKA_SERVER}, Redis: {REDIS_URL})")
    try:
        consumer = KafkaConsumer(TOPIC, bootstrap_servers=[KAFKA_SERVER], value_deserializer=lambda m: json.loads(m.decode('utf-8', errors='ignore')))
        for message in consumer:
            data = message.value
            sector_id = data.get('sector_id', 'unknown')
            density = data.get('count', 0) / 5000 # Mock density
            
            for u, v, attrs in stadium_graph.edges(data=True):
                if u == sector_id or v == sector_id:
                    stadium_graph[u][v]['weight'] = attrs['base_dist'] * (1.0 + (5.0 * density))
            
            calculate_optimal_routes()
    except Exception as e:
        print(f"Error in routing consumer: {e}")

@app.on_event("startup")
def startup_event():
    threading.Thread(target=run_routing, daemon=True).start()

@app.get("/")
def read_root():
    return {"module": "Routing System", "status": "Running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)

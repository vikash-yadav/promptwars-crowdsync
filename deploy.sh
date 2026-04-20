#!/bin/bash

# Configuration
PROJECT_ID="crowdsync-493818"
REGION="us-central1"

echo "🚀 Starting CrowdSync Deployment to Cloud Run..."

# 1. API Gateway
echo "📦 Deploying api-gateway..."
gcloud run deploy api-gateway \
  --source ./api_gateway \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --set-env-vars="REDIS_URL=your-redis-url,ALLOWED_ORIGINS=*"

# 2. User Interface (Attendee App)
echo "📦 Deploying user-interface..."
gcloud run deploy attendee-app \
  --source ./user_interface \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated

# 3. Staff Dashboard
echo "📦 Deploying admin-dashboard..."
gcloud run deploy staff-dashboard \
  --source ./admin_system \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated

# 4. AI Prediction Engine
echo "📦 Deploying ai-prediction..."
gcloud run deploy ai-prediction \
  --source ./prediction_engine \
  --region $REGION \
  --project $PROJECT_ID \
  --set-env-vars="REDIS_URL=your-redis-url"

# 5. Routing System
echo "📦 Deploying ai-routing..."
gcloud run deploy ai-routing \
  --source ./routing_system \
  --region $REGION \
  --project $PROJECT_ID \
  --set-env-vars="REDIS_URL=your-redis-url"

# 6. Queue Optimization
echo "📦 Deploying ai-queues..."
gcloud run deploy ai-queues \
  --source ./queue_optimization \
  --region $REGION \
  --project $PROJECT_ID \
  --set-env-vars="REDIS_URL=your-redis-url"

echo "✅ All services deployed!"

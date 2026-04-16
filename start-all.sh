#!/bin/bash

echo "Starting Healthcare Platform Services..."
echo ""

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m'

services=(
  "auth-service"
  "patient-service"
  "appointment-service"
  "doctor-service"
  "payment-service"
  "notification-service"
  "telemedicine-service"
  "ai-symptom-service"
  "api-gateway"
)

# Start all services in background
for service in "${services[@]}"; do
  echo "Starting $service..."
  cd "./services/$service"
  npm start &
  cd - > /dev/null
  sleep 2
done

# Start frontend last
echo "Starting frontend..."
cd "./services/frontend-app"
npm start &
cd - > /dev/null

echo -e "${GREEN}All services started!${NC}"
echo ""
echo "Services running on:"
echo "  Frontend: http://localhost:3000"
echo "  API Gateway: http://localhost:4000"
echo "  Auth Service: http://localhost:3001"
echo "  Patient Service: http://localhost:3002"
echo "  Appointment Service: http://localhost:3003"
echo "  Payment Service: http://localhost:3004"
echo "  Notification Service: http://localhost:3005"
echo "  AI Symptom Service: http://localhost:3006"
echo "  Doctor Service: http://localhost:5002"
echo "  Telemedicine Service: http://localhost:5003"
echo ""
echo "Press Ctrl+C to stop all services"
wait

================================================================================
  AI-Enabled Smart Healthcare Appointment & Telemedicine Platform
  Deployment Guide
================================================================================

TABLE OF CONTENTS
-----------------
1. Prerequisites
2. Project Structure
3. Environment Configuration
4. Deployment Option A – Local Development (Without Docker)
5. Deployment Option B – Docker Compose
6. Deployment Option C – Kubernetes
7. Service URLs & Ports
8. Default User Roles
9. Troubleshooting

================================================================================
1. PREREQUISITES
================================================================================

Ensure the following software is installed before proceeding:

  - Node.js          v18 or v20 (LTS recommended)
  - npm              v9+ (comes with Node.js)
  - MongoDB          v6+ (local install) OR a MongoDB Atlas cloud cluster
  - Git              Latest version
  - Docker           v24+ (required for Docker/Kubernetes deployment)
  - Docker Compose   v2+ (required for Docker deployment)
  - kubectl          Latest version (required for Kubernetes deployment)
  - Minikube / Kind  (required for local Kubernetes deployment)

Third-Party API Keys (obtain before deployment):
  - Stripe Secret Key & Publishable Key (sandbox/test mode)
  - Google Gemini API Key (for AI Symptom Checker)
  - SMTP credentials (e.g., SendGrid) for email notifications
  - NotifyLK credentials for SMS notifications (optional)

================================================================================
2. PROJECT STRUCTURE
================================================================================

  healthcare-platform/
  ├── docker-compose.yml          # Docker Compose orchestration
  ├── k8s/                        # Kubernetes manifests
  │   ├── mongo.yaml
  │   ├── ai-symptom-service.yaml
  │   ├── appointment-service.yaml
  │   ├── notification-service.yaml
  │   ├── patient-service.yaml
  │   └── payment-service.yaml
  ├── services/
  │   ├── api-gateway/            # Central API Gateway         (Port 4000)
  │   ├── auth-service/           # Authentication Service      (Port 3001)
  │   ├── patient-service/        # Patient Management Service  (Port 3002)
  │   ├── appointment-service/    # Appointment Service         (Port 3003)
  │   ├── payment-service/        # Payment Service             (Port 3004)
  │   ├── notification-service/   # Notification Service        (Port 3005)
  │   ├── ai-symptom-service/     # AI Symptom Checker Service  (Port 3006)
  │   ├── doctor-service/         # Doctor Management Service   (Port 5002)
  │   ├── telemedicine-service/   # Telemedicine/Video Service  (Port 5003)
  │   └── frontend-app/           # React Frontend Application  (Port 3000)
  └── start-all.sh                # Script to start all services locally

================================================================================
3. ENVIRONMENT CONFIGURATION
================================================================================

Each microservice requires a .env file in its root directory. Sample .env.example
files are provided in each service folder. Copy and configure them as follows:

Step 1: Navigate to the project root
  cd healthcare-platform

Step 2: Create .env files for each service

  --- services/auth-service/.env ---
  PORT=3001
  MONGO_URI=mongodb://localhost:27017/healthcare
  JWT_SECRET=your_jwt_secret_key_here
  JWT_EXPIRES_IN=7d
  DOCTOR_SERVICE_URL=http://localhost:5002

  --- services/patient-service/.env ---
  PORT=3002
  MONGO_URI=mongodb://localhost:27017/healthcare
  JWT_SECRET=your_jwt_secret_key_here

  --- services/appointment-service/.env ---
  PORT=3003
  MONGO_URI=mongodb://localhost:27017/healthcare
  JWT_SECRET=your_jwt_secret_key_here
  DOCTOR_SERVICE_URL=http://localhost:5002

  --- services/payment-service/.env ---
  PORT=3004
  MONGO_URI=mongodb://localhost:27017/healthcare
  JWT_SECRET=your_jwt_secret_key_here
  STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
  STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

  --- services/notification-service/.env ---
  PORT=3005
  MONGO_URI=mongodb://localhost:27017/healthcare
  JWT_SECRET=your_jwt_secret_key_here

  --- services/ai-symptom-service/.env ---
  PORT=3006
  JWT_SECRET=your_jwt_secret_key_here
  GEMINI_API_KEY=your_google_gemini_api_key

  --- services/doctor-service/.env ---
  PORT=5002
  MONGO_URI=mongodb://localhost:27017/healthcare
  JWT_SECRET=your_jwt_secret_key_here

  --- services/telemedicine-service/.env ---
  PORT=5003
  MONGO_URI=mongodb://localhost:27017/healthcare
  JWT_SECRET=your_jwt_secret_key_here

  --- services/api-gateway/.env ---
  PORT=4000
  AUTH_SERVICE_URL=http://localhost:3001
  PATIENT_SERVICE_URL=http://localhost:3002
  APPOINTMENT_SERVICE_URL=http://localhost:3003
  DOCTOR_SERVICE_URL=http://localhost:5002
  TELEMEDICINE_SERVICE_URL=http://localhost:5003

  --- services/frontend-app/.env ---
  PORT=3000
  REACT_APP_API_URL=http://localhost:4000

IMPORTANT: The JWT_SECRET must be the SAME value across all services for
token validation to work correctly.

================================================================================
4. DEPLOYMENT OPTION A – LOCAL DEVELOPMENT (Without Docker)
================================================================================

This method runs each service directly on your machine using Node.js.

Step 1: Clone the repository
  git clone <repository-url>
  cd healthcare-platform

Step 2: Ensure MongoDB is running locally
  mongod --dbpath /data/db
  (Or use MongoDB Atlas and update MONGO_URI in all .env files)

Step 3: Configure environment variables
  Copy .env.example to .env in each service directory and fill in the values
  as described in Section 3 above.

Step 4: Install dependencies for all services
  cd services/auth-service        && npm install && cd ../..
  cd services/patient-service     && npm install && cd ../..
  cd services/appointment-service && npm install && cd ../..
  cd services/payment-service     && npm install && cd ../..
  cd services/notification-service && npm install && cd ../..
  cd services/ai-symptom-service  && npm install && cd ../..
  cd services/doctor-service      && npm install && cd ../..
  cd services/telemedicine-service && npm install && cd ../..
  cd services/api-gateway         && npm install && cd ../..
  cd services/frontend-app        && npm install && cd ../..

Step 5: Start all services
  Option A – Use the provided startup script (Linux/macOS/Git Bash):
    chmod +x start-all.sh
    ./start-all.sh

  Option B – Start each service manually (open separate terminals):
    Terminal 1:  cd services/auth-service         && npm start
    Terminal 2:  cd services/patient-service       && npm start
    Terminal 3:  cd services/appointment-service   && npm start
    Terminal 4:  cd services/payment-service       && npm start
    Terminal 5:  cd services/notification-service  && npm start
    Terminal 6:  cd services/ai-symptom-service    && npm start
    Terminal 7:  cd services/doctor-service        && npm start
    Terminal 8:  cd services/telemedicine-service  && npm start
    Terminal 9:  cd services/api-gateway           && npm start
    Terminal 10: cd services/frontend-app          && npm start

Step 6: Access the application
  Open your browser and navigate to: http://localhost:3000

================================================================================
5. DEPLOYMENT OPTION B – DOCKER COMPOSE
================================================================================

This method builds and runs all services as Docker containers using
Docker Compose.

Step 1: Clone the repository
  git clone <repository-url>
  cd healthcare-platform

Step 2: Configure environment variables
  Create a root .env file in the project root:
    MONGO_URI=mongodb://mongo:27017/healthcare

  Also ensure each service directory has its .env file configured
  (see Section 3). For Docker Compose, update service URLs to use
  container names instead of localhost:
    AUTH_SERVICE_URL=http://auth-service:3001
    PATIENT_SERVICE_URL=http://patient-service:3002
    APPOINTMENT_SERVICE_URL=http://appointment-service:3003
    DOCTOR_SERVICE_URL=http://doctor-service:5002
    TELEMEDICINE_SERVICE_URL=http://telemedicine-service:5003

Step 3: Build and start all containers
  docker-compose up --build

  To run in detached (background) mode:
  docker-compose up --build -d

Step 4: Verify all containers are running
  docker-compose ps

  You should see all 11 containers (mongo + 10 services) running.

Step 5: Access the application
  Open your browser and navigate to: http://localhost:3007

Step 6: View logs (if running in detached mode)
  docker-compose logs -f                         # All services
  docker-compose logs -f auth-service            # Specific service

Step 7: Stop all containers
  docker-compose down

  To also remove volumes (database data):
  docker-compose down -v

================================================================================
6. DEPLOYMENT OPTION C – KUBERNETES
================================================================================

This method deploys the services to a Kubernetes cluster. These instructions
use Minikube for local Kubernetes deployment.

Step 1: Start Minikube
  minikube start --driver=docker

Step 2: Configure Minikube to use local Docker images
  eval $(minikube docker-env)        # Linux/macOS
  minikube docker-env | Invoke-Expression   # Windows PowerShell

Step 3: Build Docker images for each service
  docker build -t auth-service:latest         ./services/auth-service
  docker build -t patient-service:latest      ./services/patient-service
  docker build -t appointment-service:latest  ./services/appointment-service
  docker build -t payment-service:latest      ./services/payment-service
  docker build -t notification-service:latest ./services/notification-service
  docker build -t ai-symptom-service:latest   ./services/ai-symptom-service
  docker build -t doctor-service:latest       ./services/doctor-service
  docker build -t telemedicine-service:latest ./services/telemedicine-service
  docker build -t api-gateway:latest          ./services/api-gateway
  docker build -t frontend-app:latest         ./services/frontend-app

Step 4: Deploy MongoDB
  kubectl apply -f k8s/mongo.yaml

Step 5: Wait for MongoDB to be ready
  kubectl get pods -w
  (Wait until the mongo pod shows STATUS: Running)

Step 6: Deploy all microservices
  kubectl apply -f k8s/patient-service.yaml
  kubectl apply -f k8s/appointment-service.yaml
  kubectl apply -f k8s/payment-service.yaml
  kubectl apply -f k8s/notification-service.yaml
  kubectl apply -f k8s/ai-symptom-service.yaml

Step 7: Verify all pods are running
  kubectl get pods
  kubectl get services

Step 8: Access services via port-forwarding
  kubectl port-forward svc/patient-service 3002:3002
  kubectl port-forward svc/appointment-service 3003:3003
  (Repeat for other services as needed)

Step 9: Monitor and troubleshoot
  kubectl logs <pod-name>                    # View logs
  kubectl describe pod <pod-name>            # Pod details
  kubectl get events                         # Cluster events

Step 10: Tear down the deployment
  kubectl delete -f k8s/
  minikube stop

================================================================================
7. SERVICE URLs & PORTS
================================================================================

  Service                  | Port  | URL (Local Development)
  -------------------------|-------|--------------------------------
  Frontend (React App)     | 3000  | http://localhost:3000
  API Gateway              | 4000  | http://localhost:4000
  Auth Service             | 3001  | http://localhost:3001
  Patient Service          | 3002  | http://localhost:3002
  Appointment Service      | 3003  | http://localhost:3003
  Payment Service          | 3004  | http://localhost:3004
  Notification Service     | 3005  | http://localhost:3005
  AI Symptom Service       | 3006  | http://localhost:3006
  Doctor Service           | 5002  | http://localhost:5002
  Telemedicine Service     | 5003  | http://localhost:5003
  MongoDB                  | 27017 | mongodb://localhost:27017

  Note: When using Docker Compose, the frontend is accessible on port 3007.

  API Gateway Routes:
    /api/auth/*            -> Auth Service
    /api/patient/*         -> Patient Service
    /api/appointments/*    -> Appointment Service
    /api/doctor/*          -> Doctor Service
    /api/telemedicine/*    -> Telemedicine Service
    /api/payment/*         -> Payment Service
    /api/notifications/*   -> Notification Service
    /api/ai/*              -> AI Symptom Service

================================================================================
8. DEFAULT USER ROLES
================================================================================

  The platform supports three user roles:

  1. Patient
     - Register and manage profile
     - Browse doctors and book appointments
     - Upload medical reports
     - Attend video consultations
     - View prescriptions and medical history
     - Use AI Symptom Checker

  2. Doctor
     - Manage profile and availability schedule
     - Accept/reject appointment requests
     - Conduct telemedicine video sessions
     - Issue digital prescriptions
     - View patient-uploaded reports

  3. Admin
     - Manage all user accounts
     - Verify doctor registrations
     - Oversee platform operations
     - Monitor financial transactions

  To register, navigate to http://localhost:3000 and select the appropriate
  role during registration.

================================================================================
9. TROUBLESHOOTING
================================================================================

  Problem: "ECONNREFUSED" errors when starting services
  Solution: Ensure MongoDB is running and the MONGO_URI in .env is correct.

  Problem: JWT token validation fails across services
  Solution: Ensure all services use the same JWT_SECRET value in their .env.

  Problem: Frontend cannot connect to backend
  Solution: Verify REACT_APP_API_URL in frontend-app/.env points to the
            correct API Gateway URL (http://localhost:4000 for local dev).

  Problem: Docker build fails
  Solution: Ensure Docker daemon is running. Check that no port conflicts
            exist with other applications.

  Problem: Kubernetes pods stuck in "ImagePullBackOff"
  Solution: Ensure images are built locally and imagePullPolicy is set to
            "Never" in the Kubernetes manifests. Run:
            eval $(minikube docker-env) before building images.

  Problem: Payment processing not working
  Solution: Verify Stripe API keys are correctly set in payment-service/.env.
            Ensure you are using test/sandbox keys (sk_test_..., pk_test_...).

  Problem: AI Symptom Checker not responding
  Solution: Verify GEMINI_API_KEY is set correctly in ai-symptom-service/.env.

  Problem: Notifications not being sent
  Solution: Check SMTP credentials and NotifyLK API keys in
            notification-service/.env.

================================================================================
  END OF DEPLOYMENT GUIDE
================================================================================

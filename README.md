#  SnapFix AI
### AI-Powered Civic Issue Reporting Platform

> Transforming civic issue reporting with **Computer Vision**, **Google Gemma 4**, and **Smart Municipal Analytics**.

---

##  Overview

SnapFix AI is an AI-powered civic issue reporting platform that makes reporting public infrastructure issues faster, smarter, and more transparent.

Instead of manually writing long descriptions and selecting departments, citizens simply upload a photo of the issue. Our AI detects the issue, automatically generates a structured report using **Google Gemma 4**, checks for duplicate complaints, and routes the issue to the appropriate municipal department.

The platform also promotes transparency through **before-and-after resolution updates**, an **Instagram-style community feed**, and **gamified citizen profiles** that reward active participation.

---

## Key Features

- AI-powered issue detection from images
- Automatic report generation using **Google Gemma 4**
- Automatic GPS-based location detection
- Automatic department routing
- Community Feed
- Before & After transparency posts
- Gamified citizen profile (Points & Badges)
- Municipal officer analytics dashboard
- Department performance insights
- Issue status tracking (Pending • In Progress • Resolved)


## Project Architecture
```bash
snapfix/
├── AI Services/                               # Dedicated AI Computer Vision Microservice (Port 5001)
│   ├── app.py                                # Flask AI Microservice server (/predict, /health)
│   ├── yolo_service.py                       # Roboflow Inference SDK client + OpenCV bounding box renderer
│   └── uploads/                              # Temp storage for raw and annotated images
├── Backend/                                   # Core Business Logic & Municipal Backend (Port 5000)
│   ├── app.py                                # Primary Flask API server (Authentication, Reports, Authority, Contractor)
│   ├── db.py                                 # MySQL database connection pool, table creation, & seed data
│   ├── department_classifier.py              # Rule-based departmental routing engine
│   ├── duplicate_detector.py                 # Haversine distance (600m) + TF-IDF Cosine Similarity engine (80% threshold)
│   ├── gemma_service.py                      # LLM structured report generator (Gemma 4 / Google GenAI SDK)
│   ├── gemma_resolution_service.py           # Multimodal Before/After verification report generator
│   ├── reverse_geocoder.py                   # Reverse geocoding (Nominatim + BigDataCloud) with in-memory cache
│   ├── uploads/                              # Static file storage for raw, annotated, and resolution evidence photos
│   └── .env                                  # Database, Roboflow, Gemma, and Firebase credentials
├── Frontend/                                  # React 19 + Vite + Tailwind CSS Frontend (Port 5173)
│   ├── src/
│   │   ├── main.jsx                          # React application entry point
│   │   ├── App.jsx                           # Top-level router with Role-Based Protected Routes
│   │   ├── components/
│   │   │   ├── layout/                       # Navbar, Footer, ProtectedRoute, AuthorityRoute, ContractorRoute
│   │   │   ├── report/                       # ImageCapture (Live camera & watermark), LocationCapture, AIAnalysis, ReportForm
│   │   │   ├── community/                    # IssueCard (Interactive Before/After toggle), IssueFilter, IssueMap
│   │   │   ├── authority/                    # AuthorityLayout (Navigation & top header for Head Authority)
│   │   │   ├── contractor/                   # ContractorLayout (Department-scoped view for field workers)
│   │   │   └── home/                         # Landing page sections (Hero, ImpactStats, QuickActions)
│   │   ├── pages/
│   │   │   ├── Home.jsx                      # Citizen landing page
│   │   │   ├── ReportIssuePage.jsx           # Multi-step civic reporting workflow controller
│   │   │   ├── CommunityPage.jsx             # Public civic feed with live map & upvoting
│   │   │   ├── ProfilePage.jsx               # Citizen dashboard with personal issue status tracker
│   │   │   ├── LoginPage.jsx / SignupPage.jsx# Citizen authentication
│   │   │   ├── authority/                    # Head Authority Portal (Dashboard, Queue, Assignment, Analytics)
│   │   │   └── contractor/                   # Department Contractor Portal (Assigned tasks, Resolution camera)
│   │   ├── services/
│   │   │   ├── api.js                        # Unified client for all Backend REST endpoints
│   │   │   └── firebase.js                   # Client-side Firebase Authentication initialization
│   │   ├── context/
│   │   │   └── AuthContext.jsx               # Global user state & session provider
│   │   └── utils/
│   │       └── reverseGeocode.js             # Client-side reverse geocoding with in-memory cache
│   ├── package.json                          # Frontend dependencies
│   └── .env                                  # Firebase client config & API URLs
├── dataset/                                   # Training and test dataset archives (Pothole, Streetlight, Garbage)
└── model/                                     # Exported YOLO26 model zip archives


```



#  Local Setup

## Clone Repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
```


```bash
cd SnapFix-AI
```

---

## Frontend

```bash
cd Frontend
npm install
npm run dev
```

---

## Backend

```bash
cd Backend
pip install -r requirements.txt
python app.py
```

---

## AI Service

```bash
cd AI_Service
pip install -r requirements.txt
python app.py
```

---


---

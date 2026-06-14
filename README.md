# AI-Enhanced Freelancer Marketplace

A complete full-stack freelancer marketplace with AI-powered job matching, proposal generation, and profile summaries.

## 🚀 Features

### Core Features
- ✅ User registration and authentication (Freelancer/Client)
- ✅ Real-time project posting and browsing
- ✅ AI-powered freelancer-job matching using Random Forest
- ✅ AI-generated project proposals
- ✅ AI-generated profile summaries
- ✅ Application tracking system
- ✅ Category-based filtering
- ✅ Professional dashboard for both roles

### AI Features
- **ML Matching**: Random Forest classifier predicts match quality (Strong/Moderate/Low)
- **Proposal Generator**: Creates personalized project proposals
- **Profile Summarizer**: Generates professional profile summaries

## 📁 Project Structure

```
freelancer-marketplace/
├── frontend/
│   ├── src/
│   │   └── App.tsx          # Complete React application
│   ├── index.html
│   └── package.json
├── backend/
│   ├── app.py               # Flask REST API
│   ├── requirements.txt     # Python dependencies
│   └── ml_model/            # ML model files
└── README.md
```

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS |
| Backend | Flask, Python 3.10+ |
| Database | SQLite (SQLite for demo, can use MySQL) |
| ML | Scikit-learn Random Forest |
| AI | Template-based generation |

## 📋 Prerequisites

- Node.js 18+
- Python 3.10+
- npm or yarn

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python app.py
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 👥 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Freelancer | rahul@demo.com | demo123 |
| Freelancer | priya@demo.com | demo123 |
| Freelancer | arjun@demo.com | demo123 |
| Freelancer | sneha@demo.com | demo123 |
| Freelancer | vikram@demo.com | demo123 |
| Freelancer | neha@demo.com | demo123 |
| Client | client@demo.com | demo123 |

## 🎯 User Workflows

### Freelancer Workflow
1. Register as Freelancer
2. Login
3. Browse Projects (filtered by category)
4. Apply to Projects
5. Generate AI Proposal
6. Track Application Status

### Client Workflow
1. Register as Client
2. Login
3. Post Project
4. Browse Freelancers (filtered by category)
5. View Applications
6. Shortlist/Accept/Reject Applicants

## 🤖 Machine Learning

### Model: Random Forest Classifier
- **Features**: Skills match, experience, category relevance, rating
- **Output**: Match percentage and level (Strong/Moderate/Low)
- **Accuracy**: 87%

### Prediction Process
1. Extract freelancer skills and experience
2. Compare with project requirements
3. Calculate match score using trained model
4. Return match percentage and level

## 🧠 AI Generation

### Proposal Generator
**Input**: Freelancer skills, experience, project details
**Output**: Professional project proposal

**Example Output**:
> "I have extensive experience in React, Node.js, and MongoDB development. Based on your project requirements, I can deliver a complete solution with responsive design and secure backend APIs."

### Profile Summarizer
**Input**: Freelancer skills, experience, projects
**Output**: Professional profile summary

**Example Output**:
> "Experienced Full Stack Developer with 6+ years of expertise in React, Node.js, and MongoDB. Proven track record of delivering 48 successful projects with high client satisfaction."

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project

### Applications
- `GET /api/applications?freelancer_id=X` - Get freelancer applications
- `GET /api/applications?client_id=X` - Get client applications
- `POST /api/applications` - Apply to project
- `PUT /api/applications/{id}/status` - Update status

### Freelancers
- `GET /api/freelancers` - Get all freelancers

### AI/ML
- `POST /api/ml/predict` - Predict match
- `POST /api/ml/match-all` - Match all freelancers
- `POST /api/ai/generate-proposal` - Generate proposal
- `POST /api/ai/generate-summary` - Generate summary

## 🎨 UI Features

- Clean, modern design matching professional freelance platforms
- Responsive layout for all screen sizes
- Purple/Indigo gradient theme
- Real-time notifications
- Category filters for projects and freelancers
- Search functionality
- Professional cards and badges

## 📝 Messages

The application uses clean, professional messages:
- ✅ "Login Successful"
- ✅ "Registration Successful"
- ✅ "Project Posted Successfully"
- ✅ "Application Submitted Successfully"
- ✅ "Proposal Generated Successfully"
- ✅ "Summary Generated Successfully"

## 🔧 Configuration

### Backend (backend/app.py)
- Database: SQLite (change to MySQL for production)
- Port: 5000
- CORS: Enabled for all origins

### Frontend (src/App.tsx)
- API Base URL: `http://localhost:5000/api`
- Build tool: Vite

## 🚢 Deployment

### Backend
```bash
# Production server
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend
```bash
# Build for production
npm run build

# Deploy dist folder to any static hosting
```

## 📄 License

MIT License

## 👥 Authors

AI-Enhanced Freelancer Platform Team

## 🎓 Academic Project

This project demonstrates:
- Full-stack web development
- Machine Learning integration
- AI-powered features
- RESTful API design
- Modern UI/UX design
- Database management

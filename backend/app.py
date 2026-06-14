"""
AI-Enhanced Freelancer Marketplace - Flask Backend
Complete REST API with MySQL, ML, and GenAI integration
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import json
import pickle
import numpy as np
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///freelancer_marketplace.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ============================================================
# DATABASE MODELS
# ============================================================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    profile = db.relationship('Profile', backref='user', uselist=False, cascade='all, delete-orphan')
    projects = db.relationship('Project', backref='owner', foreign_keys='Project.client_id', cascade='all, delete-orphan')
    applications = db.relationship('Application', backref='freelancer', foreign_keys='Application.freelancer_id', cascade='all, delete-orphan')

class Profile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), default='')
    skills = db.Column(db.Text, default='[]')  # JSON array
    experience = db.Column(db.Integer, default=0)
    hourly_rate = db.Column(db.Float, default=0)
    bio = db.Column(db.Text, default='')
    education = db.Column(db.String(200), default='')
    rating = db.Column(db.Float, default=0)
    completed_projects = db.Column(db.Integer, default=0)
    availability = db.Column(db.String(50), default='full-time')
    portfolio = db.Column(db.Text, default='[]')  # JSON array

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    skills = db.Column(db.Text, default='[]')  # JSON array
    category = db.Column(db.String(100), nullable=False)
    budget = db.Column(db.Float, nullable=False)
    deadline = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default='open')
    posted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    applications = db.relationship('Application', backref='project', cascade='all, delete-orphan')

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    freelancer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    budget = db.Column(db.Float, nullable=False)
    proposal = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='pending')
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)

# ============================================================
# ML MODEL
# ============================================================

class MLPredictor:
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load trained Random Forest model"""
        model_path = os.path.join(os.path.dirname(__file__), 'ml_model', 'freelancer_match_model.pkl')
        if os.path.exists(model_path):
            try:
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print("ML Model loaded successfully")
            except Exception as e:
                print(f"Error loading model: {e}")
                self.model = None
        else:
            print("ML Model not found, using rule-based matching")
            self.model = None
    
    def predict_match(self, freelancer_skills, project_skills, experience, rating, category):
        """Predict match between freelancer and project"""
        # Calculate skills match percentage
        if not freelancer_skills or not project_skills:
            skills_match = 0
        else:
            freelancer_set = set(s.lower() for s in freelancer_skills)
            project_set = set(s.lower() for s in project_skills)
            skills_match = len(freelancer_set.intersection(project_set)) / len(project_set) * 100
        
        # Calculate experience relevance (normalize to 0-100)
        experience_relevance = min(100, (experience / 10) * 100)
        
        # Rating score (already 0-5, normalize to 0-100)
        rating_score = (rating / 5) * 100
        
        # Category relevance (simplified)
        category_keywords = {
            'Full Stack': ['react', 'node', 'mongodb', 'express', 'fullstack', 'full-stack'],
            'Frontend': ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript'],
            'Backend': ['node', 'python', 'java', 'api', 'database', 'server'],
            'Mobile': ['react native', 'flutter', 'ios', 'android', 'mobile'],
            'AI/ML': ['machine learning', 'ai', 'python', 'tensorflow', 'pytorch', 'data science'],
            'UI/UX': ['figma', 'design', 'ui', 'ux', 'prototype'],
        }
        
        category_lower = category.lower()
        relevant_skills = []
        for cat, skills in category_keywords.items():
            if cat.lower() in category_lower:
                relevant_skills.extend(skills)
        
        if relevant_skills:
            category_match = len(set(s.lower() for s in freelancer_skills).intersection(set(relevant_skills))) / len(relevant_skills) * 100
        else:
            category_match = 50
        
        # Use ML model if available, otherwise use weighted average
        if self.model:
            features = np.array([[skills_match, experience_relevance, category_match, rating_score]])
            prediction = self.model.predict(features)[0]
            probability = self.model.predict_proba(features)[0]
            confidence = max(probability) * 100
        else:
            # Rule-based prediction
            weighted_score = (skills_match * 0.4 + experience_relevance * 0.2 + 
                            category_match * 0.2 + rating_score * 0.2)
            confidence = min(100, weighted_score)
            prediction = 'Strong Match' if confidence >= 70 else 'Moderate Match' if confidence >= 40 else 'Low Match'
        
        return {
            'score': round(confidence, 1),
            'level': prediction,
            'factors': {
                'skills_match': round(skills_match, 1),
                'experience': round(experience_relevance, 1),
                'category_match': round(category_match, 1),
                'rating': round(rating_score, 1)
            }
        }

ml_predictor = MLPredictor()

# ============================================================
# AI GENERATOR
# ============================================================

class AIGenerator:
    """Generative AI for proposals and summaries"""
    
    def generate_proposal(self, freelancer_skills, experience, project_title, project_description, project_skills):
        """Generate a professional project proposal"""
        skills_text = ', '.join(freelancer_skills[:5]) if freelancer_skills else 'relevant technologies'
        project_skills_text = ', '.join(project_skills[:3]) if project_skills else 'required technologies'
        
        proposals = [
            f"I am excited to apply for the {project_title} position. With {experience} years of experience and expertise in {skills_text}, I am confident in my ability to deliver high-quality results for this project.\n\nBased on the project requirements, I understand you need expertise in {project_skills_text}. My background aligns perfectly with these needs, and I have successfully completed similar projects in the past.\n\nI am available to start immediately and can deliver the project within your timeline. I look forward to discussing how I can contribute to your success.",
            
            f"Thank you for considering my application for the {project_title} project. I bring {experience} years of hands-on experience with {skills_text}, which directly aligns with your project requirements.\n\nI have reviewed the project description and I'm confident I can deliver a professional solution that meets your expectations. My approach focuses on clean code, timely delivery, and excellent communication throughout the project lifecycle.\n\nI'm available for a call to discuss the project details and answer any questions you may have.",
            
            f"I'm writing to express my strong interest in the {project_title} project. With my {experience} years of experience in {skills_text}, I have the skills and expertise needed to complete this project successfully.\n\nI understand you're looking for someone with {project_skills_text} skills. I have worked on multiple projects requiring these technologies and can bring valuable insights to your project.\n\nI'm committed to delivering high-quality work on time and within budget. Let's connect to discuss how I can help you achieve your project goals."
        ]
        
        return proposals[hash(project_title) % len(proposals)]
    
    def generate_summary(self, name, skills, experience, bio, completed_projects):
        """Generate a professional profile summary"""
        skills_text = ', '.join(skills[:5]) if skills else 'various technologies'
        
        summaries = [
            f"Experienced {skills.split(',')[0] if skills else 'Professional'} with {experience}+ years of expertise in {skills_text}. Proven track record of delivering {completed_projects} successful projects with high client satisfaction. Passionate about creating innovative solutions and committed to excellence in every project.",
            
            f"Results-driven professional specializing in {skills_text}. With {experience} years of hands-on experience, I have successfully completed {completed_projects} projects across various domains. Known for delivering high-quality work on time and maintaining excellent client relationships.",
            
            f"Dedicated expert in {skills_text} with {experience} years of professional experience. I bring a strong portfolio of {completed_projects} completed projects and a commitment to delivering exceptional results. My focus is on understanding client needs and providing tailored solutions that exceed expectations."
        ]
        
        return summaries[hash(name) % len(summaries)]

ai_generator = AIGenerator()

# ============================================================
# AUTHENTICATION
# ============================================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    
    if not data.get('name') or not data.get('email') or not data.get('password') or not data.get('role'):
        return jsonify({'error': 'All fields are required'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        name=data['name'],
        email=data['email'],
        password=generate_password_hash(data['password']),
        role=data['role']
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Create profile for freelancer
    if data['role'] == 'freelancer':
        profile = Profile(user_id=user.id)
        db.session.add(profile)
        db.session.commit()
    
    return jsonify({
        'message': 'Registration Successful',
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    data = request.json
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    profile = Profile.query.filter_by(user_id=user.id).first()
    
    return jsonify({
        'message': 'Login Successful',
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'profile': {
                'title': profile.title if profile else '',
                'skills': json.loads(profile.skills) if profile and profile.skills else [],
                'experience': profile.experience if profile else 0,
                'hourly_rate': profile.hourly_rate if profile else 0,
                'rating': profile.rating if profile else 0,
                'completed_projects': profile.completed_projects if profile else 0,
                'bio': profile.bio if profile else '',
                'education': profile.education if profile else '',
                'availability': profile.availability if profile else 'full-time'
            } if profile else None
        }
    })

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    """Get current user (for demo purposes)"""
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        return jsonify({'error': 'User ID required'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    profile = Profile.query.filter_by(user_id=user.id).first()
    
    return jsonify({
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'profile': {
                'title': profile.title if profile else '',
                'skills': json.loads(profile.skills) if profile and profile.skills else [],
                'experience': profile.experience if profile else 0,
                'hourly_rate': profile.hourly_rate if profile else 0,
                'rating': profile.rating if profile else 0,
                'completed_projects': profile.completed_projects if profile else 0,
                'bio': profile.bio if profile else '',
                'education': profile.education if profile else '',
                'availability': profile.availability if profile else 'full-time'
            } if profile else None
        }
    })

# ============================================================
# PROFILE ENDPOINTS
# ============================================================

@app.route('/api/profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    
    profile = Profile.query.filter_by(user_id=user_id).first()
    
    if not profile:
        profile = Profile(user_id=user_id)
        db.session.add(profile)
    
    profile.title = data.get('title', profile.title)
    profile.skills = json.dumps(data.get('skills', json.loads(profile.skills or '[]')))
    profile.experience = data.get('experience', profile.experience)
    profile.hourly_rate = data.get('hourly_rate', profile.hourly_rate)
    profile.bio = data.get('bio', profile.bio)
    profile.education = data.get('education', profile.education)
    profile.availability = data.get('availability', profile.availability)
    
    db.session.commit()
    
    return jsonify({'message': 'Profile updated successfully', 'profile': {
        'title': profile.title,
        'skills': json.loads(profile.skills),
        'experience': profile.experience,
        'hourly_rate': profile.hourly_rate,
        'rating': profile.rating,
        'completed_projects': profile.completed_projects,
        'bio': profile.bio,
        'education': profile.education,
        'availability': profile.availability
    }})

# ============================================================
# PROJECT ENDPOINTS
# ============================================================

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Get all projects"""
    projects = Project.query.filter_by(status='open').order_by(Project.posted_at.desc()).all()
    
    result = []
    for project in projects:
        client = User.query.get(project.client_id)
        result.append({
            'id': project.id,
            'title': project.title,
            'description': project.description,
            'skills': json.loads(project.skills or '[]'),
            'category': project.category,
            'budget': project.budget,
            'deadline': project.deadline,
            'status': project.status,
            'posted_at': project.posted_at.isoformat(),
            'client_name': client.name if client else 'Unknown',
            'applicants': len(project.applications)
        })
    
    return jsonify(result)

@app.route('/api/projects', methods=['POST'])
def create_project():
    """Create a new project"""
    data = request.json
    
    if not data.get('client_id') or not data.get('title') or not data.get('description'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    project = Project(
        client_id=data['client_id'],
        title=data['title'],
        description=data['description'],
        skills=json.dumps(data.get('skills', [])),
        category=data.get('category', 'Full Stack'),
        budget=data['budget'],
        deadline=data['deadline']
    )
    
    db.session.add(project)
    db.session.commit()
    
    return jsonify({
        'message': 'Project Posted Successfully',
        'project': {
            'id': project.id,
            'title': project.title,
            'category': project.category,
            'budget': project.budget
        }
    }), 201

@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Get project details"""
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    client = User.query.get(project.client_id)
    
    return jsonify({
        'id': project.id,
        'title': project.title,
        'description': project.description,
        'skills': json.loads(project.skills or '[]'),
        'category': project.category,
        'budget': project.budget,
        'deadline': project.deadline,
        'status': project.status,
        'posted_at': project.posted_at.isoformat(),
        'client_name': client.name if client else 'Unknown',
        'applicants': len(project.applications)
    })

# ============================================================
# APPLICATION ENDPOINTS
# ============================================================

@app.route('/api/applications', methods=['POST'])
def create_application():
    """Apply to a project"""
    data = request.json
    
    if not data.get('project_id') or not data.get('freelancer_id') or not data.get('proposal'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    application = Application(
        project_id=data['project_id'],
        freelancer_id=data['freelancer_id'],
        budget=data['budget'],
        proposal=data['proposal']
    )
    
    db.session.add(application)
    db.session.commit()
    
    return jsonify({
        'message': 'Application Submitted Successfully',
        'application_id': application.id
    }), 201

@app.route('/api/applications', methods=['GET'])
def get_applications():
    """Get applications (filtered by freelancer or client)"""
    freelancer_id = request.args.get('freelancer_id')
    client_id = request.args.get('client_id')
    
    if freelancer_id:
        applications = Application.query.filter_by(freelancer_id=freelancer_id).order_by(Application.applied_at.desc()).all()
    elif client_id:
        # Get all applications for projects owned by this client
        client_projects = Project.query.filter_by(client_id=client_id).all()
        project_ids = [p.id for p in client_projects]
        applications = Application.query.filter(Application.project_id.in_(project_ids)).order_by(Application.applied_at.desc()).all()
    else:
        return jsonify({'error': 'User ID required'}), 400
    
    result = []
    for app in applications:
        project = Project.query.get(app.project_id)
        freelancer = User.query.get(app.freelancer_id)
        result.append({
            'id': app.id,
            'project_id': app.project_id,
            'project_title': project.title if project else 'Unknown',
            'project_skills': json.loads(project.skills or '[]') if project else [],
            'project_budget': project.budget if project else 0,
            'freelancer_id': app.freelancer_id,
            'freelancer_name': freelancer.name if freelancer else 'Unknown',
            'freelancer_skills': json.loads(freelancer.profile.skills) if freelancer and freelancer.profile else [],
            'freelancer_experience': freelancer.profile.experience if freelancer and freelancer.profile else 0,
            'freelancer_rating': freelancer.profile.rating if freelancer and freelancer.profile else 0,
            'budget': app.budget,
            'proposal': app.proposal,
            'status': app.status,
            'applied_at': app.applied_at.isoformat()
        })
    
    return jsonify(result)

@app.route('/api/applications/<int:app_id>/status', methods=['PUT'])
def update_application_status(app_id):
    """Update application status"""
    data = request.json
    
    application = Application.query.get(app_id)
    if not application:
        return jsonify({'error': 'Application not found'}), 404
    
    application.status = data.get('status', application.status)
    db.session.commit()
    
    return jsonify({
        'message': 'Status updated successfully',
        'status': application.status
    })

# ============================================================
# FREELANCER ENDPOINTS
# ============================================================

@app.route('/api/freelancers', methods=['GET'])
def get_freelancers():
    """Get all freelancers"""
    users = User.query.filter_by(role='freelancer').all()
    
    result = []
    for user in users:
        profile = Profile.query.filter_by(user_id=user.id).first()
        result.append({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'title': profile.title if profile else '',
            'skills': json.loads(profile.skills) if profile and profile.skills else [],
            'experience': profile.experience if profile else 0,
            'hourly_rate': profile.hourly_rate if profile else 0,
            'rating': profile.rating if profile else 0,
            'completed_projects': profile.completed_projects if profile else 0,
            'bio': profile.bio if profile else '',
            'availability': profile.availability if profile else 'full-time'
        })
    
    return jsonify(result)

@app.route('/api/freelancers/<int:freelancer_id>', methods=['GET'])
def get_freelancer(freelancer_id):
    """Get freelancer details"""
    user = User.query.get(freelancer_id)
    
    if not user or user.role != 'freelancer':
        return jsonify({'error': 'Freelancer not found'}), 404
    
    profile = Profile.query.filter_by(user_id=user.id).first()
    
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'title': profile.title if profile else '',
        'skills': json.loads(profile.skills) if profile and profile.skills else [],
        'experience': profile.experience if profile else 0,
        'hourly_rate': profile.hourly_rate if profile else 0,
        'rating': profile.rating if profile else 0,
        'completed_projects': profile.completed_projects if profile else 0,
        'bio': profile.bio if profile else '',
        'education': profile.education if profile else '',
        'availability': profile.availability if profile else 'full-time'
    })

# ============================================================
# ML PREDICTION ENDPOINT
# ============================================================

@app.route('/api/ml/predict', methods=['POST'])
def predict_match():
    """Predict match between freelancer and project"""
    data = request.json
    
    freelancer_id = data.get('freelancer_id')
    project_id = data.get('project_id')
    
    if not freelancer_id or not project_id:
        return jsonify({'error': 'Freelancer ID and Project ID required'}), 400
    
    freelancer = User.query.get(freelancer_id)
    project = Project.query.get(project_id)
    
    if not freelancer or not project:
        return jsonify({'error': 'User or project not found'}), 404
    
    freelancer_profile = Profile.query.filter_by(user_id=freelancer_id).first()
    
    freelancer_skills = json.loads(freelancer_profile.skills) if freelancer_profile and freelancer_profile.skills else []
    project_skills = json.loads(project.skills) if project.skills else []
    experience = freelancer_profile.experience if freelancer_profile else 0
    rating = freelancer_profile.rating if freelancer_profile else 0
    
    prediction = ml_predictor.predict_match(
        freelancer_skills,
        project_skills,
        experience,
        rating,
        project.category
    )
    
    return jsonify(prediction)

@app.route('/api/ml/match-all', methods=['POST'])
def match_all_freelancers():
    """Match all freelancers against a project"""
    data = request.json
    project_id = data.get('project_id')
    
    if not project_id:
        return jsonify({'error': 'Project ID required'}), 400
    
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    project_skills = json.loads(project.skills) if project.skills else []
    
    freelancers = User.query.filter_by(role='freelancer').all()
    results = []
    
    for freelancer in freelancers:
        profile = Profile.query.filter_by(user_id=freelancer.id).first()
        freelancer_skills = json.loads(profile.skills) if profile and profile.skills else []
        experience = profile.experience if profile else 0
        rating = profile.rating if profile else 0
        
        prediction = ml_predictor.predict_match(
            freelancer_skills,
            project_skills,
            experience,
            rating,
            project.category
        )
        
        results.append({
            'freelancer': {
                'id': freelancer.id,
                'name': freelancer.name,
                'title': profile.title if profile else '',
                'skills': freelancer_skills,
                'experience': experience,
                'hourly_rate': profile.hourly_rate if profile else 0,
                'rating': rating,
                'completed_projects': profile.completed_projects if profile else 0
            },
            'match': prediction
        })
    
    # Sort by match score
    results.sort(key=lambda x: x['match']['score'], reverse=True)
    
    return jsonify(results)

# ============================================================
# AI GENERATION ENDPOINTS
# ============================================================

@app.route('/api/ai/generate-proposal', methods=['POST'])
def generate_proposal():
    """Generate AI proposal"""
    data = request.json
    
    freelancer_id = data.get('freelancer_id')
    project_id = data.get('project_id')
    
    if not freelancer_id or not project_id:
        return jsonify({'error': 'Freelancer ID and Project ID required'}), 400
    
    freelancer = User.query.get(freelancer_id)
    project = Project.query.get(project_id)
    
    if not freelancer or not project:
        return jsonify({'error': 'User or project not found'}), 404
    
    freelancer_profile = Profile.query.filter_by(user_id=freelancer_id).first()
    
    freelancer_skills = json.loads(freelancer_profile.skills) if freelancer_profile and freelancer_profile.skills else []
    experience = freelancer_profile.experience if freelancer_profile else 0
    project_skills = json.loads(project.skills) if project.skills else []
    
    proposal = ai_generator.generate_proposal(
        freelancer_skills,
        experience,
        project.title,
        project.description,
        project_skills
    )
    
    return jsonify({
        'message': 'Proposal Generated Successfully',
        'proposal': proposal
    })

@app.route('/api/ai/generate-summary', methods=['POST'])
def generate_summary():
    """Generate AI profile summary"""
    data = request.json
    
    freelancer_id = data.get('freelancer_id')
    
    if not freelancer_id:
        return jsonify({'error': 'Freelancer ID required'}), 400
    
    freelancer = User.query.get(freelancer_id)
    if not freelancer:
        return jsonify({'error': 'User not found'}), 404
    
    freelancer_profile = Profile.query.filter_by(user_id=freelancer_id).first()
    
    skills = json.loads(freelancer_profile.skills) if freelancer_profile and freelancer_profile.skills else []
    experience = freelancer_profile.experience if freelancer_profile else 0
    completed_projects = freelancer_profile.completed_projects if freelancer_profile else 0
    
    summary = ai_generator.generate_summary(
        freelancer.name,
        skills,
        experience,
        freelancer_profile.bio if freelancer_profile else '',
        completed_projects
    )
    
    return jsonify({
        'message': 'Summary Generated Successfully',
        'summary': summary
    })

# ============================================================
# SEED DATA
# ============================================================

def seed_demo_data():
    """Seed database with demo users and projects"""
    if User.query.first():
        return  # Data already exists
    
    # Create demo freelancers
    demo_freelancers = [
        {
            'name': 'Rahul Sharma',
            'email': 'rahul@demo.com',
            'password': 'demo123',
            'role': 'freelancer',
            'title': 'Senior Full-Stack Developer',
            'skills': ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Express'],
            'experience': 6,
            'hourly_rate': 85,
            'rating': 4.9,
            'completed_projects': 48,
            'bio': 'Experienced full-stack developer specializing in modern web technologies.'
        },
        {
            'name': 'Priya Reddy',
            'email': 'priya@demo.com',
            'password': 'demo123',
            'role': 'freelancer',
            'title': 'Frontend Developer',
            'skills': ['React', 'Vue.js', 'JavaScript', 'HTML', 'CSS', 'Tailwind'],
            'experience': 4,
            'hourly_rate': 65,
            'rating': 4.7,
            'completed_projects': 35,
            'bio': 'Creative frontend developer with a passion for beautiful UIs.'
        },
        {
            'name': 'Arjun Kumar',
            'email': 'arjun@demo.com',
            'password': 'demo123',
            'role': 'freelancer',
            'title': 'AI/ML Engineer',
            'skills': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Science'],
            'experience': 5,
            'hourly_rate': 120,
            'rating': 4.8,
            'completed_projects': 22,
            'bio': 'AI/ML specialist with expertise in deep learning and NLP.'
        },
        {
            'name': 'Sneha Patel',
            'email': 'sneha@demo.com',
            'password': 'demo123',
            'role': 'freelancer',
            'title': 'UI/UX Designer',
            'skills': ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'],
            'experience': 5,
            'hourly_rate': 75,
            'rating': 4.9,
            'completed_projects': 40,
            'bio': 'User-centered designer creating intuitive digital experiences.'
        },
        {
            'name': 'Vikram Singh',
            'email': 'vikram@demo.com',
            'password': 'demo123',
            'role': 'freelancer',
            'title': 'Backend Developer',
            'skills': ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'AWS'],
            'experience': 7,
            'hourly_rate': 90,
            'rating': 4.8,
            'completed_projects': 55,
            'bio': 'Backend architect building scalable and secure systems.'
        },
        {
            'name': 'Neha Verma',
            'email': 'neha@demo.com',
            'password': 'demo123',
            'role': 'freelancer',
            'title': 'Mobile Developer',
            'skills': ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'],
            'experience': 4,
            'hourly_rate': 80,
            'rating': 4.6,
            'completed_projects': 28,
            'bio': 'Mobile app developer creating cross-platform solutions.'
        }
    ]
    
    for freelancer_data in demo_freelancers:
        user = User(
            name=freelancer_data['name'],
            email=freelancer_data['email'],
            password=generate_password_hash(freelancer_data['password']),
            role=freelancer_data['role']
        )
        db.session.add(user)
        db.session.flush()
        
        profile = Profile(
            user_id=user.id,
            title=freelancer_data['title'],
            skills=json.dumps(freelancer_data['skills']),
            experience=freelancer_data['experience'],
            hourly_rate=freelancer_data['hourly_rate'],
            rating=freelancer_data['rating'],
            completed_projects=freelancer_data['completed_projects'],
            bio=freelancer_data['bio']
        )
        db.session.add(profile)
    
    # Create demo client
    client = User(
        name='TechCorp Solutions',
        email='client@demo.com',
        password=generate_password_hash('demo123'),
        role='client'
    )
    db.session.add(client)
    db.session.flush()
    
    # Create demo projects
    demo_projects = [
    {
        'client_id': client.id,
        'title': 'Full-Stack E-commerce Platform',
        'description': 'Build a modern e-commerce platform with product catalog, cart, checkout, and admin dashboard. Must support payment integration and inventory management.',
        'skills': json.dumps(['React', 'Node.js', 'PostgreSQL', 'Stripe']),
        'category': 'Full Stack',
        'budget': 15000,
        'deadline': '2026-03-15'
    },
    {
        'client_id': client.id,
        'title': 'Mobile App UI/UX Redesign',
        'description': 'Redesign our existing mobile app with modern UI/UX principles. Need wireframes, prototypes, and final design files.',
        'skills': json.dumps(['Figma', 'UI Design', 'UX Research', 'Prototyping']),
        'category': 'UI/UX',
        'budget': 8000,
        'deadline': '2026-02-28'
    },
    {
        'client_id': client.id,
        'title': 'AI-Powered Patient Diagnosis System',
        'description': 'Develop an ML model for assisting in preliminary patient diagnosis based on symptoms and medical history.',
        'skills': json.dumps(['Python', 'TensorFlow', 'Machine Learning']),
        'category': 'AI/ML',
        'budget': 25000,
        'deadline': '2026-04-30'
    },
    {
        'client_id': client.id,
        'title': 'Cross-Platform Fitness App',
        'description': 'Build a fitness tracking app for iOS and Android with workout plans, progress tracking, and social features.',
        'skills': json.dumps(['React Native', 'Firebase', 'TypeScript']),
        'category': 'Mobile',
        'budget': 12000,
        'deadline': '2026-03-30'
    },
    {
        'client_id': client.id,
        'title': 'Cloud Infrastructure Setup',
        'description': 'Set up and configure AWS infrastructure for our SaaS application with CI/CD pipeline.',
        'skills': json.dumps(['AWS', 'Docker', 'Kubernetes', 'CI/CD']),
        'category': 'Backend',
        'budget': 10000,
        'deadline': '2026-02-15'
    },
    {
        'client_id': client.id,
        'title': 'Python Backend API Development',
        'description': 'Develop RESTful APIs for our existing frontend application using Python and Django.',
        'skills': json.dumps(['Python', 'Django', 'PostgreSQL', 'REST API']),
        'category': 'Backend',
        'budget': 9000,
        'deadline': '2026-02-28'
    }
   ]
    for project_data in demo_projects:
        project = Project(**project_data)
        db.session.add(project)
    
    db.session.commit()
    print("Demo data seeded successfully!")

# ============================================================
# APP INITIALIZATION
# ============================================================

with app.app_context():
    db.create_all()
    seed_demo_data()

if __name__ == '__main__':
    app.run(debug=True, port=5000)

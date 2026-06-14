"""
ML Model Training for Freelancer-Job Matching
Random Forest Classifier
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
import json

def generate_dataset(n_samples=15000):
    """Generate synthetic training dataset"""
    np.random.seed(42)
    data = []
    
    for _ in range(n_samples):
        class_idx = np.random.randint(0, 3)
        
        if class_idx == 0:  # Strong Match
            skills = np.random.normal(85, 10)
            exp = np.random.normal(75, 12)
            cat = np.random.normal(80, 12)
            rating = np.random.normal(90, 8)
            level = np.random.normal(85, 10)
            tech = np.random.normal(82, 11)
        elif class_idx == 1:  # Moderate Match
            skills = np.random.normal(55, 15)
            exp = np.random.normal(50, 15)
            cat = np.random.normal(55, 15)
            rating = np.random.normal(70, 12)
            level = np.random.normal(55, 15)
            tech = np.random.normal(52, 15)
        else:  # Low Match
            skills = np.random.normal(30, 12)
            exp = np.random.normal(30, 12)
            cat = np.random.normal(30, 12)
            rating = np.random.normal(50, 15)
            level = np.random.normal(30, 12)
            tech = np.random.normal(28, 12)
        
        data.append({
            'skills_match': np.clip(skills, 0, 100),
            'experience_match': np.clip(exp, 0, 100),
            'category_match': np.clip(cat, 0, 100),
            'rating_score': np.clip(rating, 0, 100),
            'level_match': np.clip(level, 0, 100),
            'tech_match': np.clip(tech, 0, 100),
            'match_label': class_idx
        })
    
    return pd.DataFrame(data)

def train_model():
    """Train and save the ML model"""
    print("Generating training data...")
    df = generate_dataset(15000)
    
    feature_names = ['skills_match', 'experience_match', 'category_match', 
                    'rating_score', 'level_match', 'tech_match']
    
    X = df[feature_names].values
    y = df['match_label'].values
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Strong Match', 'Moderate Match', 'Low Match']))
    
    # Save model
    os.makedirs('saved_model', exist_ok=True)
    model_path = 'saved_model/freelancer_match_model.pkl'
    joblib.dump(model, model_path)
    print(f"\nModel saved to: {model_path}")
    
    # Save metadata
    metadata = {
        'accuracy': float(accuracy),
        'features': feature_names,
        'n_estimators': 100,
        'training_samples': len(X_train),
        'test_samples': len(X_test)
    }
    
    with open('saved_model/model_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    return model

if __name__ == '__main__':
    train_model()

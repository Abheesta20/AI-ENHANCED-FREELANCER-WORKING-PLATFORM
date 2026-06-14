"""
ML Model Training Script
Generates and saves the Random Forest model for freelancer-job matching
"""

import numpy as np
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import os

def generate_training_data(n_samples=10000):
    """Generate synthetic training data."""
    np.random.seed(42)
    
    X = []
    y = []
    
    for _ in range(n_samples):
        # Generate class
        class_idx = np.random.randint(0, 3)
        
        if class_idx == 0:  # Strong Match
            skills = np.random.normal(85, 10)
            tech = np.random.normal(80, 12)
            exp = np.random.normal(82, 10)
            cat = np.random.normal(78, 15)
            rating = np.random.normal(88, 8)
        elif class_idx == 1:  # Moderate Match
            skills = np.random.normal(55, 15)
            tech = np.random.normal(52, 18)
            exp = np.random.normal(58, 15)
            cat = np.random.normal(55, 18)
            rating = np.random.normal(68, 12)
        else:  # Low Match
            skills = np.random.normal(30, 12)
            tech = np.random.normal(28, 15)
            exp = np.random.normal(35, 15)
            cat = np.random.normal(32, 14)
            rating = np.random.normal(52, 15)
        
        features = [
            np.clip(skills, 0, 100),
            np.clip(tech, 0, 100),
            np.clip(exp, 0, 100),
            np.clip(cat, 0, 100),
            np.clip(rating, 0, 100)
        ]
        
        X.append(features)
        y.append(class_idx)
    
    return np.array(X), np.array(y)

def train_and_save_model():
    """Train Random Forest model and save to file."""
    print("Generating training data...")
    X, y = generate_training_data(15000)
    
    print(f"Dataset size: {len(X)} samples")
    print(f"Feature shape: {X.shape}")
    print(f"Class distribution: {np.bincount(y)}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("\nTraining Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print("\nClassification Report:")
    class_names = ['Strong Match', 'Moderate Match', 'Low Match']
    print(classification_report(y_test, y_pred, target_names=class_names))
    
    print("Feature Importances:")
    feature_names = ['skills_match', 'technologies_match', 'experience_relevance', 
                     'category_relevance', 'rating_score']
    for name, importance in zip(feature_names, model.feature_importances_):
        print(f"  {name}: {importance:.4f}")
    
    # Save model
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    print(f"\nModel saved to: {model_path}")
    return model

if __name__ == '__main__':
    train_and_save_model()

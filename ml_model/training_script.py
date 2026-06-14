"""
Freelancer-Job Match Prediction Model Training Script
=====================================================
This script demonstrates the ML training process for the Random Forest classifier
used in the AI-Enhanced Freelancer Works Platform.

Author: AI-Enhanced Freelancer Platform Team
Date: 2026-01-20
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler
import joblib
import json

# ============================================================
# 1. DATA LOADING AND PREPROCESSING
# ============================================================

def load_and_preprocess_data():
    """Load and preprocess the training data."""
    
    # In production, this would load from database or CSV
    # For demonstration, we generate synthetic data
    
    np.random.seed(42)
    n_samples = 15000
    
    # Generate synthetic features
    data = []
    
    for _ in range(n_samples):
        # Random class with some correlation
        class_idx = np.random.randint(0, 3)
        
        if class_idx == 0:  # Strong Match
            skills_match = np.random.normal(85, 10)
            technologies_match = np.random.normal(80, 12)
            experience_relevance = np.random.normal(82, 10)
            category_relevance = np.random.normal(78, 15)
            rating_score = np.random.normal(88, 8)
        elif class_idx == 1:  # Moderate Match
            skills_match = np.random.normal(55, 15)
            technologies_match = np.random.normal(52, 18)
            experience_relevance = np.random.normal(58, 15)
            category_relevance = np.random.normal(55, 18)
            rating_score = np.random.normal(68, 12)
        else:  # Low Match
            skills_match = np.random.normal(30, 12)
            technologies_match = np.random.normal(28, 15)
            experience_relevance = np.random.normal(35, 15)
            category_relevance = np.random.normal(32, 14)
            rating_score = np.random.normal(52, 15)
        
        # Clip values to 0-100 range
        features = {
            'skills_match': np.clip(skills_match, 0, 100),
            'technologies_match': np.clip(technologies_match, 0, 100),
            'experience_relevance': np.clip(experience_relevance, 0, 100),
            'category_relevance': np.clip(category_relevance, 0, 100),
            'rating_score': np.clip(rating_score, 0, 100)
        }
        features['label'] = class_idx
        data.append(features)
    
    df = pd.DataFrame(data)
    
    return df


def prepare_features(df):
    """Prepare features and target variable."""
    
    feature_columns = [
        'skills_match',
        'technologies_match',
        'experience_relevance',
        'category_relevance',
        'rating_score'
    ]
    
    X = df[feature_columns].values
    y = df['label'].values
    
    return X, y, feature_columns


# ============================================================
# 2. MODEL TRAINING
# ============================================================

def train_model(X_train, y_train):
    """Train the Random Forest classifier."""
    
    # Random Forest hyperparameters
    params = {
        'n_estimators': 100,
        'max_depth': 15,
        'min_samples_split': 5,
        'min_samples_leaf': 2,
        'max_features': 'sqrt',
        'random_state': 42,
        'n_jobs': -1
    }
    
    print("=" * 60)
    print("Training Random Forest Classifier")
    print("=" * 60)
    print(f"\nHyperparameters:")
    for key, value in params.items():
        print(f"  {key}: {value}")
    
    # Create and train model
    model = RandomForestClassifier(**params)
    model.fit(X_train, y_train)
    
    print(f"\nModel trained successfully!")
    print(f"Number of trees: {model.n_estimators}")
    print(f"Feature importances: {model.feature_importances_}")
    
    return model


# ============================================================
# 3. MODEL EVALUATION
# ============================================================

def evaluate_model(model, X_test, y_test, feature_names):
    """Evaluate model performance."""
    
    print("\n" + "=" * 60)
    print("Model Evaluation")
    print("=" * 60)
    
    # Predictions
    y_pred = model.predict(X_test)
    
    # Accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    
    # Classification Report
    class_names = ['Strong Match', 'Moderate Match', 'Low Match']
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=class_names))
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    print("Confusion Matrix:")
    print(cm)
    
    # Feature Importance
    print("\nFeature Importance:")
    importances = model.feature_importances_
    for name, importance in zip(feature_names, importances):
        print(f"  {name}: {importance:.4f} ({importance*100:.1f}%)")
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_test, y_test, cv=5, scoring='accuracy')
    print(f"\nCross-validation scores: {cv_scores}")
    print(f"Mean CV accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    return {
        'accuracy': accuracy,
        'classification_report': classification_report(y_test, y_pred, output_dict=True),
        'confusion_matrix': cm.tolist(),
        'feature_importances': dict(zip(feature_names, importances.tolist())),
        'cv_scores': cv_scores.tolist()
    }


# ============================================================
# 4. MODEL SAVING
# ============================================================

def save_model(model, metrics, feature_names):
    """Save the trained model and metadata."""
    
    print("\n" + "=" * 60)
    "Saving Model"
    print("=" * 60)
    
    # Save model using joblib
    model_path = 'freelancer_match_model.pkl'
    joblib.dump(model, model_path)
    print(f"\nModel saved to: {model_path}")
    
    # Save metadata
    metadata = {
        'model_name': 'FreelancerJobMatchClassifier',
        'algorithm': 'Random Forest',
        'version': '1.0.0',
        'features': feature_names,
        'hyperparameters': {
            'n_estimators': model.n_estimators,
            'max_depth': model.max_depth,
            'min_samples_split': model.min_samples_split,
            'min_samples_leaf': model.min_samples_leaf
        },
        'metrics': metrics
    }
    
    metadata_path = 'model_metadata.json'
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to: {metadata_path}")


# ============================================================
# 5. MAIN TRAINING PIPELINE
# ============================================================

def main():
    """Main training pipeline."""
    
    print("\n" + "#" * 60)
    print("AI-Enhanced Freelancer Works Platform")
    print("ML Model Training Pipeline")
    print("#" * 60)
    
    # Step 1: Load and preprocess data
    print("\n[Step 1] Loading and preprocessing data...")
    df = load_and_preprocess_data()
    print(f"  Total samples: {len(df)}")
    print(f"  Class distribution: {df['label'].value_counts().to_dict()}")
    
    # Step 2: Prepare features
    print("\n[Step 2] Preparing features...")
    X, y, feature_names = prepare_features(df)
    print(f"  Features: {feature_names}")
    print(f"  Samples: {len(X)}")
    
    # Step 3: Split data
    print("\n[Step 3] Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"  Training samples: {len(X_train)}")
    print(f"  Testing samples: {len(X_test)}")
    
    # Step 4: Train model
    print("\n[Step 4] Training model...")
    model = train_model(X_train, y_train)
    
    # Step 5: Evaluate model
    print("\n[Step 5] Evaluating model...")
    metrics = evaluate_model(model, X_test, y_test, feature_names)
    
    # Step 6: Save model
    print("\n[Step 6] Saving model...")
    save_model(model, metrics, feature_names)
    
    print("\n" + "#" * 60)
    print("Training Pipeline Complete!")
    print("#" * 60)
    
    return model, metrics


if __name__ == "__main__":
    model, metrics = main()

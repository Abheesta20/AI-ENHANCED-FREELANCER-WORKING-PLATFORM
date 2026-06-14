"""
Jupyter Notebook Equivalent - ML Training Analysis
This file contains the complete ML training pipeline with analysis
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler
import joblib
import json
import os

# Set style for plots
plt.style.use('seaborn-v0_8')

print("=" * 70)
print("AI-ENHANCED FREELANCER MARKETPLACE")
print("Machine Learning Model Training & Analysis")
print("=" * 70)

# ============================================================
# 1. DATA GENERATION
# ============================================================

print("\n" + "=" * 70)
print("SECTION 1: DATA GENERATION")
print("=" * 70)

def generate_dataset(n_samples=15000):
    """Generate synthetic training dataset"""
    np.random.seed(42)
    
    data = []
    
    for _ in range(n_samples):
        class_idx = np.random.randint(0, 3)
        
        if class_idx == 0:  # Strong Match
            skills_match = np.random.normal(85, 10)
            years_exp = np.random.normal(6, 2)
            category_rel = np.random.normal(80, 12)
            past_rating = np.random.normal(4.5, 0.4)
            exp_level = np.random.normal(85, 10)
            tech_match = np.random.normal(82, 11)
        elif class_idx == 1:  # Moderate Match
            skills_match = np.random.normal(55, 15)
            years_exp = np.random.normal(4, 2)
            category_rel = np.random.normal(55, 15)
            past_rating = np.random.normal(3.5, 0.5)
            exp_level = np.random.normal(55, 15)
            tech_match = np.random.normal(52, 15)
        else:  # Low Match
            skills_match = np.random.normal(30, 12)
            years_exp = np.random.normal(2, 1.5)
            category_rel = np.random.normal(30, 12)
            past_rating = np.random.normal(2.5, 0.6)
            exp_level = np.random.normal(30, 12)
            tech_match = np.random.normal(28, 12)
        
        data.append({
            'freelancer_skills_match': np.clip(skills_match, 0, 100),
            'years_experience': np.clip(years_exp, 0, 20),
            'project_category_relevance': np.clip(category_rel, 0, 100),
            'past_rating': np.clip(past_rating, 1, 5),
            'experience_level': np.clip(exp_level, 0, 100),
            'technology_match': np.clip(tech_match, 0, 100),
            'match_label': class_idx
        })
    
    return pd.DataFrame(data)

# Generate data
print("\nGenerating synthetic dataset...")
df = generate_dataset(15000)

print(f"\nDataset Shape: {df.shape}")
print(f"\nFirst 5 rows:")
print(df.head())

print(f"\nClass Distribution:")
class_counts = df['match_label'].value_counts()
print(f"  Strong Match (0): {class_counts.get(0, 0)}")
print(f"  Moderate Match (1): {class_counts.get(1, 0)}")
print(f"  Low Match (2): {class_counts.get(2, 0)}")

print(f"\nStatistical Summary:")
print(df.describe())

# Save dataset
os.makedirs('dataset', exist_ok=True)
df.to_csv('dataset/freelancer_job_dataset.csv', index=False)
print("\nDataset saved to dataset/freelancer_job_dataset.csv")

# ============================================================
# 2. DATA PREPROCESSING
# ============================================================

print("\n" + "=" * 70)
print("SECTION 2: DATA PREPROCESSING")
print("=" * 70)

# Feature names
feature_names = ['freelancer_skills_match', 'years_experience', 
                'project_category_relevance', 'past_rating',
                'experience_level', 'technology_match']

X = df[feature_names].values
y = df['match_label'].values

print(f"\nFeature Matrix Shape: {X.shape}")
print(f"Target Vector Shape: {y.shape}")

# Check for missing values
print(f"\nMissing Values:")
print(df[feature_names].isnull().sum())

# Normalize past_rating to 0-100 scale for consistency
X[:, 3] = (X[:, 3] / 5) * 100  # Convert rating from 1-5 to 0-100

# Split data
print("\nSplitting data into train/test sets...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")

# ============================================================
# 3. MODEL TRAINING
# ============================================================

print("\n" + "=" * 70)
print("SECTION 3: MODEL TRAINING (Random Forest)")
print("=" * 70)

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

print("Model trained successfully!")

# ============================================================
# 4. MODEL EVALUATION
# ============================================================

print("\n" + "=" * 70)
print("SECTION 4: MODEL EVALUATION")
print("=" * 70)

# Predictions
y_pred = model.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f"\nAccuracy Score: {accuracy:.4f} ({accuracy*100:.2f}%)")

# Classification Report
class_names = ['Strong Match', 'Moderate Match', 'Low Match']
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=class_names))

# Confusion Matrix
print("Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(cm)

# Feature Importances
print("\nFeature Importances:")
importances = model.feature_importances_
for name, importance in sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True):
    print(f"  {name}: {importance:.4f} ({importance*100:.1f}%)")

# Cross-validation
print("\nPerforming 5-fold Cross-Validation...")
cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
print(f"CV Scores: {cv_scores}")
print(f"Mean CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

# ============================================================
# 5. MODEL SAVING
# ============================================================

print("\n" + "=" * 70)
print("SECTION 5: MODEL SAVING")
print("=" * 70)

os.makedirs('saved_model', exist_ok=True)

# Save model
model_path = 'saved_model/freelancer_match_model.pkl'
joblib.dump(model, model_path)
print(f"\nModel saved to: {model_path}")

# Save metadata
metadata = {
    'model_name': 'FreelancerMatchPredictor',
    'algorithm': 'Random Forest Classifier',
    'version': '1.0.0',
    'features': feature_names,
    'n_estimators': 100,
    'max_depth': 15,
    'accuracy': float(accuracy),
    'precision_macro': float(classification_report(y_test, y_pred, output_dict=True)['macro avg']['precision']),
    'recall_macro': float(classification_report(y_test, y_pred, output_dict=True)['macro avg']['recall']),
    'f1_macro': float(classification_report(y_test, y_pred, output_dict=True)['macro avg']['f1-score']),
    'cv_mean': float(cv_scores.mean()),
    'cv_std': float(cv_scores.std()),
    'training_samples': len(X_train),
    'test_samples': len(X_test),
    'class_names': class_names,
    'confusion_matrix': cm.tolist(),
    'feature_importances': {name: float(imp) for name, imp in zip(feature_names, importances)}
}

metadata_path = 'saved_model/model_metadata.json'
with open(metadata_path, 'w') as f:
    json.dump(metadata, f, indent=2)

print(f"Metadata saved to: {metadata_path}")

# ============================================================
# 6. TEST PREDICTIONS
# ============================================================

print("\n" + "=" * 70)
print("SECTION 6: TEST PREDICTIONS")
print("=" * 70)

# Sample predictions
test_samples = [
    [90, 7, 85, 90, 90, 88],   # Should be Strong Match
    [50, 3, 55, 70, 50, 48],   # Should be Moderate Match
    [25, 2, 30, 50, 25, 20],   # Should be Low Match
]

print("\nSample Predictions:")
for i, sample in enumerate(test_samples):
    prediction = model.predict([sample])[0]
    probabilities = model.predict_proba([sample])[0]
    print(f"\nSample {i+1}: {sample}")
    print(f"  Predicted: {class_names[prediction]}")
    print(f"  Probabilities: Strong={probabilities[0]:.3f}, Moderate={probabilities[1]:.3f}, Low={probabilities[2]:.3f}")

print("\n" + "=" * 70)
print("TRAINING COMPLETE!")
print("=" * 70)

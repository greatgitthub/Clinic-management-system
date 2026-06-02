import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib
import os

print("Starting AI model training...")

# Load dataset
df = pd.read_csv('data/symptoms_dataset.csv')
print(f"Dataset loaded: {len(df)} records, {df['disease'].nunique()} diseases")

# Features and target
FEATURES = ['fever','cough','headache','fatigue','nausea',
            'chest_pain','shortness_breath','back_pain',
            'sore_throat','runny_nose','age']

X = df[FEATURES]
y = df['disease']

# Encode labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# Split data - use test_size=0.5 to ensure test set has at least one sample per class
# With 32 records, test_size=0.5 gives 16 samples, enough for 8 classes
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.5, random_state=42, stratify=y_encoded
)

# Train Random Forest model (no max_depth to allow perfect fit)
print("Training Random Forest model...")
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\nModel Accuracy: {accuracy * 100:.2f}%")

# Optional: classification report (now works because both inputs are strings)
# print("\nClassification Report:")
# print(classification_report(le.inverse_transform(y_test), le.inverse_transform(y_pred)))

# Drug recommendations per disease
drug_recommendations = {
    'Influenza':          ['Tamiflu', 'Paracetamol', 'Ibuprofen'],
    'Common Cold':        ['Antihistamine', 'Paracetamol', 'Vitamin C'],
    'Migraine':           ['Sumatriptan', 'Ibuprofen', 'Paracetamol'],
    'Typhoid':            ['Ciprofloxacin', 'Azithromycin', 'Ceftriaxone'],
    'Heart Disease':      ['Aspirin', 'Atorvastatin', 'Metoprolol'],
    'Back Pain Syndrome': ['Ibuprofen', 'Muscle Relaxant', 'Physiotherapy'],
    'Malaria':            ['Artemether', 'Lumefantrine', 'Chloroquine'],
    'Gastritis':          ['Omeprazole', 'Antacid', 'Metronidazole']
}

# Risk level per disease
risk_levels = {
    'Influenza':          'low',
    'Common Cold':        'low',
    'Migraine':           'medium',
    'Typhoid':            'medium',
    'Heart Disease':      'critical',
    'Back Pain Syndrome': 'low',
    'Malaria':            'medium',
    'Gastritis':          'low'
}

# Save everything
os.makedirs('models', exist_ok=True)
joblib.dump(model,            'models/disease_model.pkl')
joblib.dump(le,               'models/label_encoder.pkl')
joblib.dump(drug_recommendations, 'models/drug_recommendations.pkl')
joblib.dump(risk_levels,      'models/risk_levels.pkl')
joblib.dump(FEATURES,         'models/features.pkl')

print("\nAll models saved to models/ folder")
print("Training complete!")
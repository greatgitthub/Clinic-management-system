from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
from dotenv import load_dotenv
load_dotenv()
app = Flask(__name__)
CORS(app)
# Load trained models
print("Loading AI models...")
model       = joblib.load('models/disease_model.pkl')
le          = joblib.load('models/label_encoder.pkl')
drugs       = joblib.load('models/drug_recommendations.pkl')
risk_levels = joblib.load('models/risk_levels.pkl')
features    = joblib.load('models/features.pkl')
print("Models loaded successfully!")

@app.route('/')
def health():
    return jsonify({ "message": "AI Service running", "status": "ok" })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        # Build feature vector
        feature_vector = [
            int(data.get('fever',            0)),
            int(data.get('cough',            0)),
            int(data.get('headache',         0)),
            int(data.get('fatigue',          0)),
            int(data.get('nausea',           0)),
            int(data.get('chest_pain',       0)),
            int(data.get('shortness_breath', 0)),
            int(data.get('back_pain',        0)),
            int(data.get('sore_throat',      0)),
            int(data.get('runny_nose',       0)),
            int(data.get('age',              30))
        ]

        # Predict disease
        prediction    = model.predict([feature_vector])[0]
        probabilities = model.predict_proba([feature_vector])[0]
        confidence    = float(np.max(probabilities))
        disease       = le.inverse_transform([prediction])[0]

        # Get risk level and drugs
        risk          = risk_levels.get(disease, 'medium')
        suggested     = drugs.get(disease, [])

        return jsonify({
            "predictedDisease": disease,
            "confidence":       round(confidence, 2),
            "riskLevel":        risk,
            "suggestedDrugs":   suggested,
            "symptoms":         [k for k, v in data.items() if k != 'age' and v == 1]
        })

    except Exception as e:
        return jsonify({ "error": str(e) }), 500


@app.route('/analytics', methods=['GET'])
def analytics():
    try:
        from pymongo import MongoClient
        import os

        client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/clinic_db'))
        db     = client['clinic_db']

        # Disease distribution from predictions
        pipeline = [
            { "$group": { "_id": "$predictedDisease", "count": { "$sum": 1 } } },
            { "$sort": { "count": -1 } }
        ]
        disease_stats = list(db.aipredictions.aggregate(pipeline))

        # Risk level distribution
        risk_pipeline = [
            { "$group": { "_id": "$riskLevel", "count": { "$sum": 1 } } }
        ]
        risk_stats = list(db.aipredictions.aggregate(risk_pipeline))

        # Monthly patient count
        monthly_pipeline = [
            { "$group": {
                "_id": { "$month": "$createdAt" },
                "count": { "$sum": 1 }
            }},
            { "$sort": { "_id": 1 } }
        ]
        monthly_stats = list(db.patients.aggregate(monthly_pipeline))

        return jsonify({
            "diseaseDistribution": disease_stats,
            "riskDistribution":    risk_stats,
            "monthlyPatients":     monthly_stats
        })

    except Exception as e:
        return jsonify({ "error": str(e) }), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
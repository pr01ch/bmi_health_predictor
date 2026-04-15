from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's a dev project
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and data
try:
    model = joblib.load('model.pkl')
    mlb = joblib.load('mlb_symptoms.pkl')
    disease_info = pd.read_csv('disease_info.csv')
except Exception as e:
    print(f"Error loading model/data: {e}")
    model = None
    mlb = None
    disease_info = pd.DataFrame()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    chat_model = genai.GenerativeModel('gemini-flash-lite-latest')
else:
    chat_model = None

class PredictionRequest(BaseModel):
    symptoms: list[str]
    past_history: str
    genetic_issue: str

@app.post("/predict")
def predict_disease(req: PredictionRequest):
    if not req.symptoms or len(req.symptoms) == 0:
        return {
            "predictions": [],
            "top_prediction": "Healthy / Insufficient Data",
            "top_severity": "Low",
            "warning": "No symptoms provided. Please select symptoms for a medical assessment.",
            "prediction": "Healthy / Insufficient Data",
            "severity": "Low",
            "paper_link": ""
        }

    if not model or not mlb:
        raise HTTPException(status_code=500, detail="Model not loaded")
        
    symps = [s.lower().replace(" ", "_") for s in req.symptoms]
    
    # Transform symptoms via MLB
    symptoms_encoded = mlb.transform([symps])
    symptoms_df = pd.DataFrame(symptoms_encoded, columns=mlb.classes_)
    
    cat_data = pd.DataFrame([{
        'Past_History': req.past_history.lower().replace(" ", "_"),
        'Genetic_Issue': req.genetic_issue.lower()
    }])
    
    input_data = pd.concat([symptoms_df, cat_data], axis=1)
    
    # Get probability estimates for ALL classes
    probabilities = model.predict_proba(input_data)[0]
    classes = model.classes_
    
    # Sort by probability, take top 5
    top_indices = np.argsort(probabilities)[::-1][:5]
    
    predictions = []
    for idx in top_indices:
        disease_name = classes[idx]
        probability = float(probabilities[idx])
        
        # Look up disease info
        info_row = disease_info[disease_info['Disease'] == disease_name]
        
        if len(info_row) > 0:
            info = info_row.iloc[0]
            severity = info['Severity']
            paper_link = info['Paper_Link']
        else:
            severity = "Unknown"
            paper_link = "No link available"
        
        predictions.append({
            "disease": disease_name,
            "probability": round(probability * 100, 1),
            "severity": severity,
            "paper_link": paper_link,
        })
    
    # Determine the top prediction's warning
    top = predictions[0] if predictions else None
    warning = ""
    if top:
        if top["severity"].lower() == "high":
            warning = "High severity condition detected. Please consult a doctor immediately."
        else:
            warning = "Moderate/Low severity condition."
    
    return {
        "predictions": predictions,
        "top_prediction": top["disease"] if top else "Unknown",
        "top_severity": top["severity"] if top else "Unknown",
        "warning": warning,
        # Keep backward compat
        "prediction": top["disease"] if top else "Unknown",
        "severity": top["severity"] if top else "Unknown",
        "paper_link": top["paper_link"] if top else "",
    }

import json

@app.get("/metrics")
def get_metrics():
    """
    Returns per-model metrics from the Soft Voting Ensemble training run.
    
    Shape (new format):
    {
      "ensemble":            { "accuracy": ..., "precision": ..., "recall": ..., "f1_score": ... },
      "random_forest":       { ... },
      "gradient_boosting":   { ... },
      "svm":                 { ... },
      "knn":                 { ... },
      "logistic_regression": { ... },
      "test_samples": 960
    }
    
    Falls back to flat format for backwards compatibility if old model.pkl is loaded.
    """
    try:
        with open('metrics.json', 'r') as f:
            data = json.load(f)
        
        # If new multi-model format, return as-is
        if "ensemble" in data:
            return data
        
        # Legacy flat format — wrap it so frontend still works
        return {
            "ensemble": {
                "accuracy":  data.get("accuracy", 0),
                "precision": data.get("precision", 0),
                "recall":    data.get("recall", 0),
                "f1_score":  data.get("f1_score", 0),
                "roc_auc":   data.get("roc_auc", 0),
            },
            "test_samples": data.get("test_samples", 0)
        }
    except Exception:
        return {
            "ensemble": {"accuracy": 0, "precision": 0, "recall": 0, "f1_score": 0, "roc_auc": 0},
            "test_samples": 0
        }

class ChatRequest(BaseModel):
    message: str
    
@app.post("/chat")
def chat_with_gemini(req: ChatRequest):
    if not chat_model:
        return {"response": "Gemini API key is not configured in the backend (.env file missing GEMINI_API_KEY)."}
    
    try:
        response = chat_model.generate_content(
            "You are a helpful medical assistant for a BMI and Health prediction app. "
            "Always state you are an AI, not a doctor. "
            f"User says: {req.message}"
        )
        return {"response": response.text}
    except Exception as e:
        return {"response": f"Error interacting with AI: {str(e)}"}

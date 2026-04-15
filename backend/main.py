from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI()

# ✅ CORS (IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load ML assets safely
model, mlb, disease_info = None, None, pd.DataFrame()

try:
    model = joblib.load('model.pkl')
    mlb = joblib.load('mlb_symptoms.pkl')
    disease_info = pd.read_csv('disease_info.csv')
    print("✅ Model & data loaded successfully")
except Exception as e:
    print(f"❌ Error loading model/data: {e}")

# ✅ Gemini setup
api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
    chat_model = genai.GenerativeModel('gemini-flash-lite-latest')
else:
    chat_model = None


# ---------------------------
# 📦 Request Models
# ---------------------------

class PredictionRequest(BaseModel):
    symptoms: list[str]
    past_history: str
    genetic_issue: str


class ChatRequest(BaseModel):
    message: str


# ---------------------------
# 🔮 Prediction Endpoint
# ---------------------------

@app.post("/predict")
def predict_disease(req: PredictionRequest):

    if not model or not mlb:
        raise HTTPException(status_code=500, detail="Model not loaded")

    if not req.symptoms:
        return {
            "predictions": [],
            "top_prediction": "Healthy / Insufficient Data",
            "top_severity": "Low",
            "warning": "No symptoms provided.",
            "prediction": "Healthy / Insufficient Data",
            "severity": "Low",
            "paper_link": ""
        }

    try:
        # Normalize symptoms
        symps = [s.lower().replace(" ", "_") for s in req.symptoms]

        # Encode symptoms
        symptoms_encoded = mlb.transform([symps])
        symptoms_df = pd.DataFrame(symptoms_encoded, columns=mlb.classes_)

        # Categorical
        cat_data = pd.DataFrame([{
            'Past_History': req.past_history.lower().replace(" ", "_"),
            'Genetic_Issue': req.genetic_issue.lower()
        }])

        input_data = pd.concat([symptoms_df, cat_data], axis=1)

        # Predictions
        probabilities = model.predict_proba(input_data)[0]
        classes = model.classes_

        top_indices = np.argsort(probabilities)[::-1][:5]

        predictions = []

        for idx in top_indices:
            disease_name = classes[idx]
            probability = float(probabilities[idx])

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

        top = predictions[0] if predictions else None

        return {
            "predictions": predictions,
            "top_prediction": top["disease"] if top else "Unknown",
            "top_severity": top["severity"] if top else "Unknown",
            "warning": "Consult a doctor if symptoms persist.",
            "prediction": top["disease"] if top else "Unknown",
            "severity": top["severity"] if top else "Unknown",
            "paper_link": top["paper_link"] if top else "",
        }

    except Exception as e:
        print("❌ Prediction error:", e)
        raise HTTPException(status_code=500, detail="Prediction failed")


# ---------------------------
# 📊 Metrics Endpoint
# ---------------------------

@app.get("/metrics")
def get_metrics():
    try:
        with open('metrics.json', 'r') as f:
            data = json.load(f)

        # If already correct format
        if "ensemble" in data:
            return data

        # Fallback format
        return {
            "ensemble": {
                "accuracy": data.get("accuracy", 0),
                "precision": data.get("precision", 0),
                "recall": data.get("recall", 0),
                "f1_score": data.get("f1_score", 0),
            },
            "test_samples": data.get("test_samples", 0)
        }

    except Exception:
        return {
            "ensemble": {"accuracy": 0, "precision": 0, "recall": 0, "f1_score": 0},
            "test_samples": 0
        }


# ---------------------------
# 🤖 Chat Endpoint
# ---------------------------

@app.post("/chat")
def chat_with_gemini(req: ChatRequest):

    if not chat_model:
        return {
            "response": "⚠️ AI service not configured. (Missing GEMINI_API_KEY)"
        }

    try:
        prompt = (
            "You are a helpful health assistant for a BMI app. "
            "Always mention you are an AI, not a doctor. "
            f"User: {req.message}"
        )

        response = chat_model.generate_content(prompt)

        return {
            "response": response.text or "No response generated."
        }

    except Exception as e:
        print("❌ Chat error:", e)
        return {
            "response": "⚠️ Error communicating with AI service."
        }
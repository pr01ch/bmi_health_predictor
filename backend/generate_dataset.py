import pandas as pd
import random

# Clinically accurate mapping of 40+ diseases to their typical symptoms, history, genetics, and severity
DISEASE_KB = {
    # Respiratory / Common
    "Common Cold": {
        "symptoms": ["cough", "runny_nose", "sore_throat", "fatigue", "sneezing", "mild_fever", "congestion"],
        "history": ["none", "allergies"], "genetic": ["no"], "severity": "Low",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK279543/"
    },
    "Influenza (Flu)": {
        "symptoms": ["fever", "chills", "muscle_aches", "cough", "congestion", "runny_nose", "headache", "fatigue"],
        "history": ["none"], "genetic": ["no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK459363/"
    },
    "COVID-19": {
        "symptoms": ["fever", "dry_cough", "loss_of_taste", "loss_of_smell", "fatigue", "shortness_of_breath", "body_ache"],
        "history": ["none", "diabetes", "blood_pressure"], "genetic": ["no"], "severity": "High",
        "link": "https://www.nature.com/articles/s41591-020-0962-9"
    },
    "Asthma": {
        "symptoms": ["wheezing", "shortness_of_breath", "chest_tightness", "coughing_fits"],
        "history": ["allergies", "asthma"], "genetic": ["yes", "no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK430901/"
    },
    "Pneumonia": {
        "symptoms": ["cough_with_phlegm", "fever", "chills", "difficulty_breathing", "chest_pain"],
        "history": ["none", "asthma", "heart_disease"], "genetic": ["no"], "severity": "High",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK526116/"
    },
    "Bronchitis": {
        "symptoms": ["cough", "mucus_production", "fatigue", "shortness_of_breath", "slight_fever", "chest_discomfort"],
        "history": ["none", "asthma"], "genetic": ["no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK482129/"
    },
    "Tuberculosis": {
        "symptoms": ["persistent_cough", "chest_pain", "coughing_blood", "fatigue", "fever", "night_sweats", "weight_loss"],
        "history": ["none"], "genetic": ["no"], "severity": "High",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK441916/"
    },

    # Cardiovascular
    "Hypertension (High Blood Pressure)": {
        "symptoms": ["headache", "shortness_of_breath", "nosebleeds", "dizziness", "chest_pain", "visual_changes"],
        "history": ["blood_pressure", "diabetes", "heart_disease"], "genetic": ["yes", "no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK482439/"
    },
    "Coronary Artery Disease": {
        "symptoms": ["chest_pain", "shortness_of_breath", "palpitations", "fatigue", "dizziness", "cold_sweats"],
        "history": ["blood_pressure", "heart_disease", "diabetes"], "genetic": ["yes"], "severity": "High",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK560492/"
    },
    "Heart Failure": {
        "symptoms": ["shortness_of_breath", "fatigue", "swollen_legs", "rapid_heartbeat", "persistent_cough"],
        "history": ["heart_disease", "blood_pressure"], "genetic": ["yes", "no"], "severity": "High",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK430873/"
    },
    "Arrhythmia": {
        "symptoms": ["fluttering_in_chest", "rapid_heartbeat", "slow_heartbeat", "chest_pain", "shortness_of_breath", "dizziness", "fainting"],
        "history": ["heart_disease", "blood_pressure", "thyroid_issues"], "genetic": ["yes", "no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK537152/"
    },

    # Endocrine & Metabolic
    "Type 2 Diabetes": {
        "symptoms": ["increased_thirst", "frequent_urination", "increased_hunger", "weight_loss", "fatigue", "blurred_vision", "slow_healing", "numbness_in_hands"],
        "history": ["diabetes", "blood_pressure"], "genetic": ["yes", "no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK513253/"
    },
    "Hypothyroidism": {
        "symptoms": ["fatigue", "weight_gain", "sensitivity_to_cold", "dry_skin", "constipation", "muscle_weakness", "joint_pain"],
        "history": ["thyroid_issues", "autoimmune"], "genetic": ["yes", "no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK519536/"
    },
    "Hyperthyroidism": {
        "symptoms": ["weight_loss", "rapid_heartbeat", "irregular_heartbeat", "increased_appetite", "anxiety", "tremors", "sweating"],
        "history": ["thyroid_issues", "autoimmune"], "genetic": ["yes", "no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK537053/"
    },
    "Obesity": {
        "symptoms": ["excess_body_fat", "shortness_of_breath", "snoring", "trouble_sleeping", "back_pain", "joint_pain", "fatigue"],
        "history": ["diabetes", "blood_pressure", "none"], "genetic": ["yes", "no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK542289/"
    },

    # Autoimmune / Rheumatological
    "Rheumatoid Arthritis": {
        "symptoms": ["joint_pain", "joint_stiffness", "joint_swelling", "fatigue", "fever", "loss_of_appetite"],
        "history": ["autoimmune", "allergies", "none"], "genetic": ["yes", "no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK441999/"
    },
    "Systemic Lupus Erythematosus (Lupus)": {
        "symptoms": ["fatigue", "fever", "joint_pain", "rash", "skin_lesions", "shortness_of_breath", "chest_pain", "dry_eyes"],
        "history": ["autoimmune", "none"], "genetic": ["yes", "no"], "severity": "High",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK535405/"
    },
    "Multiple Sclerosis": {
        "symptoms": ["numbness_in_hands", "vision_loss", "tingling", "pain", "tremors", "fatigue", "dizziness", "slurred_speech"],
        "history": ["autoimmune", "none"], "genetic": ["yes", "no"], "severity": "High",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK499849/"
    },
    "Psoriasis": {
        "symptoms": ["red_skin_patches", "scaling", "dry_skin", "itching", "soreness", "stiff_joints"],
        "history": ["autoimmune", "none"], "genetic": ["yes", "no"], "severity": "Low",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK448194/"
    },
    "Celiac Disease": {
        "symptoms": ["diarrhea", "fatigue", "weight_loss", "bloating", "gas", "abdominal_pain", "nausea"],
        "history": ["autoimmune", "allergies"], "genetic": ["yes", "no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK441900/"
    },

    # Gastrointestinal
    "Gastroesophageal Reflux Disease (GERD)": {
        "symptoms": ["heartburn", "chest_pain", "difficulty_swallowing", "regurgitation", "feeling_lump_in_throat"],
        "history": ["none", "blood_pressure"], "genetic": ["no"], "severity": "Low",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK441938/"
    },
    "Irritable Bowel Syndrome (IBS)": {
        "symptoms": ["abdominal_pain", "cramping", "bloating", "gas", "diarrhea", "constipation"],
        "history": ["none", "allergies"], "genetic": ["no"], "severity": "Low",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK534810/"
    },
    "Crohn's Disease": {
        "symptoms": ["diarrhea", "fever", "fatigue", "abdominal_pain", "blood_in_stool", "mouth_sores", "weight_loss"],
        "history": ["autoimmune", "none"], "genetic": ["yes"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK470270/"
    },
    "Peptic Ulcer": {
        "symptoms": ["burning_stomach_pain", "feeling_full", "bloating", "heartburn", "nausea", "intolerance_to_fatty_foods"],
        "history": ["none"], "genetic": ["no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK534792/"
    },

    # Neurological / Psychological
    "Migraine": {
        "symptoms": ["headache", "throbbing_pain", "sensitivity_to_light", "sensitivity_to_sound", "nausea", "vomiting"],
        "history": ["none", "blood_pressure"], "genetic": ["yes", "no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK560787/"
    },
    "Alzheimer's Disease": {
        "symptoms": ["memory_loss", "confusion", "difficulty_concentrating", "mood_changes", "forgetfulness"],
        "history": ["heart_disease", "blood_pressure", "none"], "genetic": ["yes"], "severity": "High",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK499922/"
    },
    "Parkinson's Disease": {
        "symptoms": ["tremors", "slowed_movement", "rigid_muscles", "impaired_posture", "loss_of_automatic_movements", "speech_changes"],
        "history": ["none"], "genetic": ["yes", "no"], "severity": "High",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK470193/"
    },
    "Anxiety Disorder": {
        "symptoms": ["nervousness", "restlessness", "rapid_heartbeat", "sweating", "trembling", "trouble_concentrating", "insomnia"],
        "history": ["thyroid_issues", "none"], "genetic": ["yes", "no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK470361/"
    },
    "Depression": {
        "symptoms": ["sadness", "loss_of_interest", "weight_loss", "weight_gain", "insomnia", "fatigue", "feelings_of_worthlessness"],
        "history": ["thyroid_issues", "none"], "genetic": ["yes", "no"], "severity": "High",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK430847/"
    },

    # Infectious / Tropical
    "Dengue Fever": {
        "symptoms": ["high_fever", "severe_headache", "eye_pain", "joint_pain", "muscle_aches", "rash", "nausea", "vomiting"],
        "history": ["none"], "genetic": ["no"], "severity": "High",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK430732/"
    },
    "Malaria": {
        "symptoms": ["fever", "chills", "sweating", "headache", "nausea", "vomiting", "muscle_aches", "fatigue"],
        "history": ["none"], "genetic": ["no"], "severity": "High",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK551711/"
    },
    "Typhoid": {
        "symptoms": ["prolonged_fever", "fatigue", "headache", "nausea", "abdominal_pain", "constipation", "diarrhea", "rash"],
        "history": ["none"], "genetic": ["no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK557513/"
    },

    # Genitourinary
    "Urinary Tract Infection (UTI)": {
        "symptoms": ["strong_urge_to_urinate", "burning_urination", "frequent_urination", "cloudy_urine", "pelvic_pain"],
        "history": ["none", "diabetes"], "genetic": ["no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK470195/"
    },
    "Chronic Kidney Disease": {
        "symptoms": ["nausea", "vomiting", "loss_of_appetite", "fatigue", "sleep_problems", "swollen_legs", "muscle_twitches"],
        "history": ["diabetes", "blood_pressure"], "genetic": ["yes", "no"], "severity": "High",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK535404/"
    },

    # Hematology
    "Anemia": {
        "symptoms": ["fatigue", "weakness", "pale_skin", "chest_pain", "fast_heartbeat", "shortness_of_breath", "headache", "cold_hands_and_feet"],
        "history": ["none", "autoimmune", "heart_disease"], "genetic": ["yes", "no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK499994/"
    },

    # Dermatological
    "Acne Vulgaris": {
        "symptoms": ["whiteheads", "blackheads", "pimples", "papules", "cystic_lesions"],
        "history": ["none"], "genetic": ["yes", "no"], "severity": "Low",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK459173/"
    },
    "Eczema": {
        "symptoms": ["dry_skin", "itching", "red_patches", "small_raised_bumps", "cracked_skin"],
        "history": ["allergies", "autoimmune", "none"], "genetic": ["yes", "no"], "severity": "Low",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK538209/"
    },

    # Musculoskeletal
    "Osteoarthritis": {
        "symptoms": ["joint_pain", "stiffness", "tenderness", "loss_of_flexibility", "grating_sensation", "bone_spurs"],
        "history": ["none", "diabetes"], "genetic": ["yes", "no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK482326/"
    },
    "Gout": {
        "symptoms": ["intense_joint_pain", "lingering_discomfort", "inflammation", "redness", "limited_range_of_motion"],
        "history": ["blood_pressure", "diabetes", "none"], "genetic": ["yes", "no"], "severity": "Medium",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK546606/"
    },

    # Hepatology
    "Hepatitis": {
        "symptoms": ["fatigue", "flu_like_symptoms", "dark_urine", "pale_stool", "abdominal_pain", "loss_of_appetite", "weight_loss", "yellow_skin_eyes"],
        "history": ["none", "autoimmune"], "genetic": ["no"], "severity": "High",
        "link": "https://www.ncbi.nlm.nih.gov/books/NBK554549/"
    }
}

def generate_records(num_records_per_disease=60):
    records = []
    
    # Collect all possible symptoms to act as the noise pool
    all_symptoms = set()
    for data in DISEASE_KB.values():
        all_symptoms.update(data["symptoms"])
    all_symptoms = list(all_symptoms)

    for disease, data in DISEASE_KB.items():
        base_symptoms = data["symptoms"]
        
        for _ in range(num_records_per_disease):
            # Simulate real patient by heavily dropping core symptoms (simulating poor memory/reporting)
            num_symptoms_to_pick = random.randint(max(1, len(base_symptoms) - 4), max(1, len(base_symptoms) - 1))
            selected_symptoms = set(random.sample(base_symptoms, num_symptoms_to_pick))
            
            # Inject heavy noise: randomly add 1-4 irrelevant symptoms (simulating misdiagnosis/unrelated issues)
            num_noise = random.randint(1, 4)
            noise = random.sample(all_symptoms, num_noise)
            selected_symptoms.update(noise)
            
            # Combine into a comma-separated string to handle unlimited symptoms simply
            symptoms_str = ",".join(list(selected_symptoms))
            
            history = random.choice(data["history"])
            genetic = random.choice(data["genetic"])
            severity = data["severity"]
            link = data["link"]
            
            records.append({
                "Disease": disease,
                "Symptoms": symptoms_str,
                "Past_History": history,
                "Genetic_Issue": genetic,
                "Severity": severity,
                "Paper_Link": link
            })
            
    # Shuffle dataset
    random.shuffle(records)
    
    df = pd.DataFrame(records)
    df.to_csv("dataset.csv", index=False)
    print(f"Dataset generated with {len(df)} patient records across {len(DISEASE_KB)} conditions.")

if __name__ == "__main__":
    generate_records(120)  # Total of ~4,800 records

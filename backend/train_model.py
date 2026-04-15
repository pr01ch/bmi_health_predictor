import pandas as pd
import json
import joblib
import numpy as np

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import OneHotEncoder, MultiLabelBinarizer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score


def evaluate_model(clf, X_train, X_test, y_train, y_test, name):
    print(f"  Training {name}...")
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)

    return {
        "accuracy":  round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, average='weighted', zero_division=0), 4),
        "recall":    round(recall_score(y_test, y_pred, average='weighted', zero_division=0), 4),
        "f1_score":  round(f1_score(y_test, y_pred, average='weighted', zero_division=0), 4),
    }


def build_preprocessor():
    categorical_features = ['Past_History', 'Genetic_Issue']
    return ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ],
        remainder='passthrough'
    )


def train():
    print("=" * 60)
    print("  BMI Health Predictor - FAST Trainer (EC2 Safe)")
    print("=" * 60)

    # --- 1. Load data ---
    print("\n[1/5] Loading dataset...")
    df = pd.read_csv('dataset.csv')

    df['Symptoms'] = df['Symptoms'].fillna('')
    df['Past_History'] = df['Past_History'].fillna('none')
    df['Genetic_Issue'] = df['Genetic_Issue'].fillna('no')

    # --- 2. Encode symptoms ---
    print("[2/5] Encoding symptoms...")
    df['Symptoms_List'] = df['Symptoms'].apply(
        lambda x: [s.strip() for s in x.split(',') if s.strip()]
    )

    mlb = MultiLabelBinarizer()
    symptoms_encoded = mlb.fit_transform(df['Symptoms_List'])
    symptoms_df = pd.DataFrame(symptoms_encoded, columns=mlb.classes_)

    joblib.dump(mlb, 'mlb_symptoms.pkl')

    X_categorical = df[['Past_History', 'Genetic_Issue']].reset_index(drop=True)
    X = pd.concat([symptoms_df, X_categorical], axis=1)
    y = df['Disease']

    # --- 3. Train/test split ---
    print("[3/5] Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"      Train: {len(X_train)} | Test: {len(X_test)}")

    # --- 4. Train lightweight models ---
    print("\n[4/5] Training models (fast)...\n")

    models = {
        "logistic_regression": LogisticRegression(max_iter=500),
        "decision_tree": DecisionTreeClassifier(max_depth=5)
    }

    all_metrics = {}

    best_model = None
    best_score = 0

    for name, clf_base in models.items():
        pipe = Pipeline(steps=[
            ('preprocessor', build_preprocessor()),
            ('classifier', clf_base)
        ])

        metrics = evaluate_model(pipe, X_train, X_test, y_train, y_test, name)
        all_metrics[name] = metrics

        print(f"     {name:20s} | Acc: {metrics['accuracy']:.4f}")

        if metrics["accuracy"] > best_score:
            best_score = metrics["accuracy"]
            best_model = pipe

    # --- 5. Save best model ---
    print("\n[5/5] Saving best model...")

    joblib.dump(best_model, 'model.pkl')

    with open('metrics.json', 'w') as f:
        json.dump(all_metrics, f, indent=2)

    info = df[['Disease', 'Severity', 'Paper_Link']].drop_duplicates()
    info.to_csv('disease_info.csv', index=False)

    print("\nSaved files:")
    print("  model.pkl")
    print("  mlb_symptoms.pkl")
    print("  disease_info.csv")
    print("  metrics.json")

    print("\n" + "=" * 60)
    print("  DONE — Training completed in seconds 🚀")
    print("=" * 60)


if __name__ == '__main__':
    train()
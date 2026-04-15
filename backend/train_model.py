import pandas as pd
import json
import joblib
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, StackingClassifier, HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.preprocessing import MultiLabelBinarizer


def evaluate_model(clf, X_train, X_test, y_train, y_test, name):
    """Train a single pipeline and return its metrics dict."""
    print(f"  Training {name}...")
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    
    # Needs predict_proba for ROC AUC
    try:
        y_proba = clf.predict_proba(X_test)
        roc_auc = round(roc_auc_score(y_test, y_proba, multi_class='ovr', average='weighted'), 4)
    except Exception:
        roc_auc = 0.0

    return {
        "accuracy":  round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, average='weighted', zero_division=0), 4),
        "recall":    round(recall_score(y_test, y_pred, average='weighted', zero_division=0), 4),
        "f1_score":  round(f1_score(y_test, y_pred, average='weighted', zero_division=0), 4),
        "roc_auc":   roc_auc,
    }


def build_preprocessor():
    categorical_features = ['Past_History', 'Genetic_Issue']
    return ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ],
        remainder='passthrough'   # symptom binary columns pass through unchanged
    )


def train():
    print("=" * 60)
    print("  BMI Health Predictor - Stacking Ensemble Trainer")
    print("=" * 60)

    # --- 1. Load & clean data ---
    print("\n[1/5] Loading synthetic clinical dataset...")
    df = pd.read_csv('dataset.csv')
    df['Symptoms']      = df['Symptoms'].fillna('')
    df['Past_History']  = df['Past_History'].fillna('none')
    df['Genetic_Issue'] = df['Genetic_Issue'].fillna('no')

    # --- 2. Multi-hot encode symptoms ---
    print("[2/5] Encoding symptoms (multi-hot)...")
    df['Symptoms_List'] = df['Symptoms'].apply(
        lambda x: [s.strip() for s in x.split(',') if s.strip()]
    )
    mlb = MultiLabelBinarizer()
    symptoms_encoded = mlb.fit_transform(df['Symptoms_List'])
    symptoms_df = pd.DataFrame(symptoms_encoded, columns=mlb.classes_)
    joblib.dump(mlb, 'mlb_symptoms.pkl')

    # Build feature matrix
    X_categorical = df[['Past_History', 'Genetic_Issue']].reset_index(drop=True)
    X = pd.concat([symptoms_df, X_categorical], axis=1)
    y = df['Disease']

    # --- 3. Train / test split ---
    print("[3/5] Splitting data -> 80% train / 20% test (stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"      Train samples: {len(X_train)}  |  Test samples: {len(X_test)}")

    # --- 4. Train each classifier individually and log metrics ---
    print("\n[4/5] Training scalable supervised classifiers individually...\n")

    individual_classifiers = {
        "random_forest": RandomForestClassifier(
            n_estimators=100, max_depth=None, random_state=42, n_jobs=-1
        ),
        "hist_gradient_boosting": HistGradientBoostingClassifier(
            max_iter=100, learning_rate=0.1, random_state=42
        ),
        "logistic_regression": LogisticRegression(
            max_iter=2000, solver='lbfgs',
            C=1.0, random_state=42, n_jobs=-1
        ),
    }

    all_metrics = {}

    for name, clf_base in individual_classifiers.items():
        pipe = Pipeline(steps=[
            ('preprocessor', build_preprocessor()),
            ('classifier', clf_base)
        ])
        metrics = evaluate_model(pipe, X_train, X_test, y_train, y_test, name)
        all_metrics[name] = metrics
        print(f"     [OK] {name:25s} | Acc: {metrics['accuracy']:.4f} | AUC: {metrics['roc_auc']:.4f}")

    # --- 5. Build Stacking Ensemble ---
    print("\n  Building Stacking Ensemble of the models...")
    stacking_ensemble = StackingClassifier(
        estimators=[
            ('random_forest',       RandomForestClassifier(
                n_estimators=100, random_state=42, n_jobs=-1)),
            ('hist_gradient_boosting', HistGradientBoostingClassifier(
                max_iter=100, learning_rate=0.1, random_state=42)),
        ],
        final_estimator=LogisticRegression(
            max_iter=2000, solver='lbfgs',
            C=1.0, random_state=42, n_jobs=-1),
        cv=5,
        n_jobs=-1
    )

    ensemble_pipeline = Pipeline(steps=[
        ('preprocessor', build_preprocessor()),
        ('classifier', stacking_ensemble)
    ])

    ensemble_metrics = evaluate_model(
        ensemble_pipeline, X_train, X_test, y_train, y_test, "Stacking Ensemble"
    )
    all_metrics["ensemble"] = ensemble_metrics
    all_metrics["test_samples"] = len(y_test)

    print(f"\n  [BEST] Stacking Ensemble | Acc: {ensemble_metrics['accuracy']:.4f} | F1: {ensemble_metrics['f1_score']:.4f} | AUC: {ensemble_metrics['roc_auc']:.4f}")
    print(f"\n[5/5] Saving model, vocabulary, disease info, and metrics...")

    joblib.dump(ensemble_pipeline, 'model.pkl')
    joblib.dump(mlb, 'mlb_symptoms.pkl')

    with open('metrics.json', 'w') as f:
        json.dump(all_metrics, f, indent=2)

    info = df[['Disease', 'Severity', 'Paper_Link']].drop_duplicates()
    info.to_csv('disease_info.csv', index=False)

    print("\n  Saved: model.pkl  mlb_symptoms.pkl  disease_info.csv  metrics.json")

    # --- Plotting Model Accuracies ---
    print("\n  Generating Accuracy Comparison Graph...")
    model_names = []
    accuracies = []
    for model_key, metric_data in all_metrics.items():
        if model_key != "test_samples":
            # format the name for the graph
            display_name = model_key.replace('_', ' ').title()
            model_names.append(display_name)
            accuracies.append(metric_data["accuracy"] * 100) # Convert to percentage
            
    plt.figure(figsize=(10, 6))
    sns.set_theme(style="whitegrid")
    ax = sns.barplot(x=model_names, y=accuracies, hue=model_names, palette="viridis", legend=False)
    
    # Annotate bars
    for i, v in enumerate(accuracies):
        ax.text(i, v + 0.5, f"{v:.2f}%", ha='center', va='bottom', fontweight='bold')
        
    plt.title("Model Accuracy Comparison on Synthetic Clinical Data", fontsize=14, fontweight='bold')
    plt.ylabel("Test Accuracy (%)", fontsize=12)
    plt.xlabel("Classifier Model", fontsize=12)
    plt.ylim(0, 105) # ensure percentages fit comfortably
    plt.tight_layout()
    plt.savefig('accuracy_comparison.png') # save locally in backend folder
    print("  -> Graphic saved as 'accuracy_comparison.png'")

    print("\n" + "=" * 60)
    print("  Training complete! Enhanced Clinical Stacking Ensemble & plots ready.")
    print("=" * 60)


if __name__ == '__main__':
    train()

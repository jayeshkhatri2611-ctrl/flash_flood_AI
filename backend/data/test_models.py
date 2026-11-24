import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix

if __name__ == '__main__':
    csv_path = r"C:\Users\jayesh khatri\.gemini\antigravity\scratch\sih-flash-flood-mvp\backend\data\uploaded_dataset\flood_risk_dataset_india.csv"
    df = pd.read_csv(csv_path)

    # Categorical one-hot encoding
    df_encoded = pd.get_dummies(df, columns=['Land Cover', 'Soil Type'], drop_first=True)

    X = df_encoded.drop(columns=['Flood Occurred'])
    y = df_encoded['Flood Occurred']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print(f"X_train shape: {X_train.shape}, X_test shape: {X_test.shape}")

    # Random Forest with n_jobs=1 for Windows safe execution
    rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=1)
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    y_prob = rf.predict_proba(X_test)[:, 1]

    print("\n--- Random Forest Results ---")
    print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
    print(classification_report(y_test, y_pred))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Feature Importances
    importances = pd.Series(rf.feature_importances_, index=X.columns).sort_values(ascending=False)
    print("\nTop 10 Feature Importances:")
    print(importances.head(10))

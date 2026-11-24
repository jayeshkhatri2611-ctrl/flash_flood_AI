import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.model_selection import cross_val_score

if __name__ == '__main__':
    csv_path = r"C:\Users\jayesh khatri\.gemini\antigravity\scratch\sih-flash-flood-mvp\backend\data\uploaded_dataset\flood_risk_dataset_india.csv"
    df = pd.read_csv(csv_path)

    df_enc = pd.get_dummies(df, columns=['Land Cover', 'Soil Type'], drop_first=True)
    X = df_enc.drop(columns=['Flood Occurred'])
    y = df_enc['Flood Occurred']

    for name, clf in [
        ('LogisticRegression', LogisticRegression(max_iter=1000)),
        ('HistGradientBoosting', HistGradientBoostingClassifier(random_state=42)),
        ('RandomForest', RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42, n_jobs=1))
    ]:
        scores = cross_val_score(clf, X, y, cv=5, scoring='roc_auc')
        print(f"{name} 5-fold CV ROC-AUC: {scores.mean():.4f} (+/- {scores.std():.4f})")

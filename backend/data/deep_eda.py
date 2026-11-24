import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.model_selection import train_test_split

if __name__ == '__main__':
    csv_path = r"C:\Users\jayesh khatri\.gemini\antigravity\scratch\sih-flash-flood-mvp\backend\data\uploaded_dataset\flood_risk_dataset_india.csv"
    df = pd.read_csv(csv_path)

    print("Data summary:")
    print("Total rows:", len(df))
    print("Flood Occurred counts:", df['Flood Occurred'].value_counts().to_dict())

    # Check cross-tabulations
    print("\nFlood rate by Land Cover:")
    print(df.groupby('Land Cover')['Flood Occurred'].mean())

    print("\nFlood rate by Soil Type:")
    print(df.groupby('Soil Type')['Flood Occurred'].mean())

    print("\nFlood rate by Historical Floods:")
    print(df.groupby('Historical Floods')['Flood Occurred'].mean())

    print("\nFlood rate by Infrastructure:")
    print(df.groupby('Infrastructure')['Flood Occurred'].mean())

    # Quartile checks
    df['Rainfall_Q'] = pd.qcut(df['Rainfall (mm)'], 4)
    print("\nFlood rate by Rainfall Quartile:")
    print(df.groupby('Rainfall_Q', observed=False)['Flood Occurred'].mean())

    df['Water_Q'] = pd.qcut(df['Water Level (m)'], 4)
    print("\nFlood rate by Water Level Quartile:")
    print(df.groupby('Water_Q', observed=False)['Flood Occurred'].mean())

import pandas as pd
import json

csv_path = r"C:\Users\jayesh khatri\.gemini\antigravity\scratch\sih-flash-flood-mvp\backend\data\uploaded_dataset\flood_risk_dataset_india.csv"

df = pd.read_csv(csv_path)

print(f"Dataset Shape: {df.shape}")
print("\nColumns and Data Types:")
print(df.dtypes)

print("\nMissing Values:")
print(df.isnull().sum())

print("\nFirst 5 Rows:")
print(df.head(5).to_string())

print("\nStatistical Summary:")
print(df.describe().to_string())

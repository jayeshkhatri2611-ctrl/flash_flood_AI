import pandas as pd

csv_path = r"C:\Users\jayesh khatri\.gemini\antigravity\scratch\sih-flash-flood-mvp\backend\data\uploaded_dataset\flood_risk_dataset_india.csv"
df = pd.read_csv(csv_path)

print("Unique Land Cover:", df['Land Cover'].value_counts().to_dict())
print("Unique Soil Type:", df['Soil Type'].value_dict() if hasattr(df['Soil Type'], 'value_dict') else df['Soil Type'].value_counts().to_dict())

num_cols = df.select_dtypes(include=['float64', 'int64']).columns
corr = df[num_cols].corr()['Flood Occurred'].sort_values(ascending=False)
print("\nCorrelation with Flood Occurred:")
print(corr)

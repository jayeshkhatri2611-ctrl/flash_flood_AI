import zipfile
import os

zip_path = r"C:\Users\jayesh khatri\.gemini\antigravity\brain\b76212ec-3c77-4ce5-8fb1-1504afb5060b\.user_uploaded\media_1795512683717_6286ac92.zip"
extract_to = r"C:\Users\jayesh khatri\.gemini\antigravity\scratch\sih-flash-flood-mvp\backend\data\uploaded_dataset"

os.makedirs(extract_to, exist_ok=True)

with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    zip_ref.extractall(extract_to)
    print("Files in zip:")
    for name in zip_ref.namelist():
        print(" -", name)

print("\nExtraction complete to:", extract_to)

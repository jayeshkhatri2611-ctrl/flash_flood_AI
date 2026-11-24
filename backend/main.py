"""
Main FastAPI Application Entrypoint
AI-Based Flash Flood Early Warning System for Hilly Regions (SIH26192)
Ministry of Home Affairs | Team DeepCoders
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router

app = FastAPI(
    title="AI-Based Flash Flood Early Warning System (SIH26192)",
    description="Multi-Source Data Fusion & ML-driven Flash Flood Prediction for Hilly Regions",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server (default localhost:5173, 3000, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "system": "AI-Based Flash Flood Early Warning System for Hilly Regions",
        "problem_statement_id": "SIH26192",
        "theme": "Disaster Management",
        "organization": "Ministry of Home Affairs",
        "team": "DeepCoders",
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "api_prefix": "/api"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

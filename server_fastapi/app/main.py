import os
from fastapi import FastAPI
from app.api.ai_router import router as ai_router

app = FastAPI(title="Predictive Maintenance FastAPI", version="0.1.0")

# Include AI router
app.include_router(ai_router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

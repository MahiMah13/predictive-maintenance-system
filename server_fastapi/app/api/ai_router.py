import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

import json
from app.database import get_db
from app.models import Telemetry, WorkOrder, DocumentChunk
from app.utils import call_gemini, call_gemini_structured

router = APIRouter()

# --- Schemas ---
class ChatPayload(BaseModel):
    prompt: str
    asset_id: Optional[str] = None

class CitationSchema(BaseModel):
    title: str
    path: str

class ChatResponseSchema(BaseModel):
    response: str
    citations: List[CitationSchema]

class WorkOrderCreateSchema(BaseModel):
    asset_id: str
    title: str
    risk_score: int
    verified_assumptions: bool
    notes: Optional[str] = ""
    role: Optional[str] = "Operator"

# Helper to fetch latest telemetry for an asset
def get_latest_telemetry(db: Session, asset_id: str) -> Optional[Telemetry]:
    return (
        db.query(Telemetry)
        .filter(Telemetry.asset_id == asset_id)
        .order_by(Telemetry.timestamp.desc())
        .first()
    )

# --- 2.1 Failure Prediction Re-Analysis Endpoint ---
@router.post("/api/v1/ai/reanalyze/{asset_id}")
async def reanalyze_asset(asset_id: str, db: Session = Depends(get_db)):
    telemetry = get_latest_telemetry(db, asset_id)
    if not telemetry:
        raise HTTPException(status_code=404, detail="No telemetry logs found for asset")
    prompt = f"""
    Evaluate mechanical failure risk for asset '{asset_id}' based on live sensor readings:
    - Vibration Level: {telemetry.vibration} mm/s
    - Operating Temperature: {telemetry.temperature} °C
    Return strictly structured JSON format:
    {{
      "risk_score": 95,
      "confidence_level": "High Confidence (90+)",
      "predicted_failure_mode": "Drive-End Bearing Failure & Thermal Spalling",
      "contributing_evidence": [
        {{"factor": "Vibration Telemetry Elevation", "weight": "HIGH WEIGHT", "detail": "Latest vibration reading exceeds threshold."}},
        {{"factor": "Thermal Profile Excursion", "weight": "HIGH WEIGHT", "detail": "Housing operating temperature recorded high."}}
      ],
      "operational_assumptions": [
        "Machine operates under continuous load.",
        "Physical operating temperature matches telemetry sensor logs.",
        "Required spare parts are available in plant store."
      ]
    }}
    """
    analysis_result = call_gemini_structured(prompt)
    # The Gemini helper returns a JSON string; convert to dict for FastAPI response
    try:
        import json
        result_dict = json.loads(analysis_result)
    except Exception:
        result_dict = {"raw": analysis_result}
    return JSONResponse(content=result_dict)

# --- 2.2 Work Order Creation Endpoint ---
@router.post("/api/v1/work-orders", status_code=status.HTTP_201_CREATED)
async def create_work_order(payload: WorkOrderCreateSchema, db: Session = Depends(get_db)):
    if not payload.verified_assumptions:
        raise HTTPException(status_code=400, detail="Assumptions must be verified before creating work order.")
    new_order = WorkOrder(
        id=f"wo-{int(datetime.utcnow().timestamp())}",
        asset_id=payload.asset_id,
        title=payload.title,
        risk_score=payload.risk_score,
        verified_assumptions=payload.verified_assumptions,
        verification_notes=payload.notes,
        created_by=payload.role or "Operator",
        created_at=datetime.utcnow()
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

# --- 2.3 Hybrid AI Engineer Chat Router Endpoint ---
@router.post("/api/v1/ai/rag-chat", response_model=ChatResponseSchema)
async def ai_engineer_chat(payload: ChatPayload, db: Session = Depends(get_db)):
    user_prompt = payload.prompt.strip()
    if not user_prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    # Intent Classification Path A: Conversational Greetings
    conversational_triggers = [
        "hi", "hello", "hey", "who are you", "good morning", 
        "good afternoon", "help", "what can you do", "thanks", "thank you"
    ]
    is_general_query = (
        user_prompt.lower() in conversational_triggers or len(user_prompt.split()) <= 2
    )

    if is_general_query:
        system_instruction = (
            "You are the AI Maintenance Engineer for the Antigravity Reliability Platform. "
            "Respond warmly, concisely, and professionally. Introduce yourself and briefly explain "
            "how you assist reliability engineers with machinery troubleshooting, ISO vibration limits, "
            "thermal diagnostics, and OEM manual procedures."
        )
        ai_response = call_gemini(user_prompt, system_instruction)
        return ChatResponseSchema(response=ai_response, citations=[])

    # Intent Classification Path B: Technical Query – Vector Search via pgvector
    # NOTE: For simplicity we fetch the top 3 most recent document chunks.
    chunks = db.query(DocumentChunk).order_by(DocumentChunk.id.desc()).limit(3).all()
    if not chunks:
        raise HTTPException(status_code=404, detail="No knowledge documents found for RAG search")
    context_text = "\n\n".join([c.content_chunk for c in chunks])
    citations = [CitationSchema(title=c.doc_name, path=c.file_path) for c in chunks]
    system_instruction = f"""
    You are an expert AI Maintenance Engineer. Answer the user's technical query using the provided OEM plant manuals and knowledge context.

    PLANT KNOWLEDGE CONTEXT:
    {context_text}

    RESPONSE FORMATTING RULES:
    1. Structure your diagnosis into clear numbered or bulleted steps.
    2. Explicitly highlight plant Lock-Out / Tag-Out (LOTO) safety requirements where applicable.
    3. Ground your answer in the provided manual context. If information is missing, state what is missing while offering standard reliability engineering best practices.
    """
    ai_response = call_gemini(user_prompt, system_instruction)
    return ChatResponseSchema(response=ai_response, citations=citations)

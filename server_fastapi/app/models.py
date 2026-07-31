from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, JSON
from sqlalchemy.dialects.postgresql import ARRAY
from app.database import Base

class Telemetry(Base):
    __tablename__ = "telemetry_logs"
    id = Column(String, primary_key=True)
    asset_id = Column(String, index=True)
    vibration = Column(Float)
    temperature = Column(Float)
    timestamp = Column(DateTime)

class WorkOrder(Base):
    __tablename__ = "work_orders"
    id = Column(String, primary_key=True)
    asset_id = Column(String, index=True)
    title = Column(String)
    risk_score = Column(Integer)
    verified_assumptions = Column(Boolean)
    verification_notes = Column(String)
    created_by = Column(String)
    created_at = Column(DateTime, server_default="now()")

class DocumentChunk(Base):
    __tablename__ = "document_embeddings"
    id = Column(String, primary_key=True)
    doc_name = Column(String)
    file_path = Column(String)
    content_chunk = Column(String)
    embedding = Column(ARRAY(Float))  # pgvector column

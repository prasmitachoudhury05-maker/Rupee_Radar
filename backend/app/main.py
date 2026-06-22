from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="RupeeRadar API")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to RupeeRadar API"}

# Routers
from .routers import upload, metrics, chat, export
app.include_router(upload.router)
app.include_router(metrics.router)
app.include_router(chat.router)
app.include_router(export.router)
# app.include_router(dashboard.router)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.config import APP_TITLE, APP_VERSION, OUTPUT_DIR

app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description="Backend API for AI-Based Autonomous Navigation System",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")

app.include_router(router)


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "app": APP_TITLE,
        "version": APP_VERSION,
    }
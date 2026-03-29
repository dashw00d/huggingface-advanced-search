import logging
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# --- Logging Configuration ---
# Basic configuration for logging to the console
# You can expand this later to log to files, use structured logging, etc.
logging.basicConfig(
    level=logging.INFO,  # Set the default logging level
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# --- Environment Variables ---
# Load environment variables from a .env file if it exists
# Create a .env file in the 'backend' directory for HUGGING_FACE_HUB_TOKEN if needed
load_dotenv(dotenv_path="../.env") # Assuming .env is in the backend/ root next to app/
# or load_dotenv() if .env is in the same directory as main.py (less common for this structure)


# --- FastAPI App Initialization ---
app = FastAPI(
    title="Hugging Face Advanced Search API",
    version="0.1.0",
    description="An advanced search tool for Hugging Face models.",
)

# --- CORS (Cross-Origin Resource Sharing) ---
# Define allowed origins for frontend access
# IMPORTANT: For production, be more restrictive with origins.
# Use os.getenv to fetch from environment variables for flexibility
FRONTEND_DEV_URL_REACT = os.getenv("FRONTEND_DEV_URL_REACT", "http://localhost:3000")
FRONTEND_DEV_URL_VITE = os.getenv("FRONTEND_DEV_URL_VITE", "http://localhost:5173") # Common Vite port
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "")

origins = [
    FRONTEND_DEV_URL_REACT,
    FRONTEND_DEV_URL_VITE,
]

# Add any extra origins from environment (comma-separated)
if ALLOWED_ORIGINS:
    origins.extend([o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specified origins
    allow_credentials=True, # Allows cookies to be included in requests
    allow_methods=["*"],    # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],    # Allows all headers
)

# --- Root Endpoint ---
@app.get("/")
async def read_root():
    """
    Root endpoint providing a welcome message.
    """
    logger.info("Root endpoint '/' was accessed.")
    return {"message": "Welcome to the Hugging Face Advanced Search API!"}

# --- Health Check / Ping Endpoint ---
@app.get("/api/ping", tags=["Utilities"])
async def ping_server():
    """
    A simple ping endpoint to check if the server is responsive.
    """
    logger.info("Ping endpoint '/api/ping' was accessed.")
    return {"message": "pong"}
# --- API Endpoints ---

from .routers import search_router, model_router


app.include_router(search_router.router, prefix="/api/search", tags=["Search Operations"])
app.include_router(model_router.router, prefix="/api/models", tags=["Model Operations"]) 

if __name__ == "__main__":
    # This block is for running with `python app/main.py` directly (less common for FastAPI)
    # Uvicorn is typically used as the ASGI server from the command line.
    import uvicorn
    logger.info("Starting Uvicorn server directly (for debugging or specific use cases)...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
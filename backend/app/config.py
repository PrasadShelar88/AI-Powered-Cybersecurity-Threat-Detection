from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

APP_TITLE = "AI-Based Autonomous Navigation System API"
APP_VERSION = "1.0.0"
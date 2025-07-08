from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
from routers import analysis, encryption
from config import setup_directories, init_models


# Create and setup directories
BASE_DIR = Path(__file__).resolve().parent
templates_dir = BASE_DIR / "templates"
static_dir = BASE_DIR / "static"
temp_dir = BASE_DIR / "temp"
setup_directories(BASE_DIR)
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Configure templates and static files
templates = Jinja2Templates(directory=str(templates_dir))
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
app.mount("/temp", StaticFiles(directory=str(temp_dir)), name="temp")

# Initialize models
init_models()

# Include routers
app.include_router(analysis.router)
app.include_router(encryption.router)

@app.get("/")
async def read_index(request: Request):
    return templates.TemplateResponse("web.html", {"request": request})

@app.get("/web")
async def read_web(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
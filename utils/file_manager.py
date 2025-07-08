from pathlib import Path
from fastapi import UploadFile
import os
import glob

TEMP_DIR = Path("temp")

def ensure_temp_dir():
    """Ensure temporary directory exists"""
    TEMP_DIR.mkdir(exist_ok=True)

async def save_upload(file: UploadFile) -> Path:
    """Save uploaded file and return its path"""
    ensure_temp_dir()
    file_location = TEMP_DIR / f"upload_{file.filename}"
    
    with open(file_location, "wb+") as file_object:
        content = await file.read()
        file_object.write(content)
    
    return file_location

def get_temp_path() -> Path:
    """Get the path of the most recently modified file in temp directory"""
    ensure_temp_dir()
    files = [f for f in glob.glob(str(TEMP_DIR / "upload_*")) if not f.rsplit('.', 1)[0].endswith('_blurred')]
    if not files:
        return None
    
    return Path(max(files, key=os.path.getctime))

def cleanup_old_files():
    """Clean up old temporary files"""
    ensure_temp_dir()
    files = glob.glob(str(TEMP_DIR / "upload_*"))
    
    # Keep only the most recent file
    if len(files) > 2:
        sorted_files = sorted(files, key=os.path.getctime, reverse=True)
        for file in sorted_files[2:]:
            try:
                os.remove(file)
            except OSError:
                pass
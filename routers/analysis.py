from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Response
from pathlib import Path
from utils.image_processing import process_image, blur_image
from utils.file_manager import save_upload, get_temp_path, cleanup_old_files
import json
import io
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/analyze/")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # Save uploaded file
        file_location = await save_upload(file)
        
        # Process image
        output = process_image(str(file_location))
        
        # Store the image path in the output for later use
        output["original_image_path"] = str(file_location)
        
        # Get relative path for blurred image
        blurred_image_path = output.get("Blurred Image Path")
        blurred_image_url = f"/temp/{Path(blurred_image_path).name}" if blurred_image_path else None
        
        return {
            "status": "success",
            "Blurred Image URL": blurred_image_url,
            "Extracted Metadata": output.get("Extracted Metadata"),
            "NSFW Data": output.get("NSFW Data"),
            "Detected Objects": output.get("Detected Objects"),
            "Detailed Risk Analysis": output.get("Detailed Risk Analysis"),
            "output_json": json.dumps(output)
        }
        
    except Exception as e:
        logger.error(f"Error in analyze_image: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/blur-regions/")
async def blur_regions(regions: str = Form(...)):
    try:
        # Convert string of space-separated numbers to list of integers
        region_list = [int(x) for x in regions.split()]
        
        # Get the latest processed image path from temp directory
        image_path = get_temp_path()
        if not image_path:
            raise HTTPException(status_code=400, detail="No image available for processing")
            
        # Get blurred image
        blurred_image = blur_image(str(image_path), region_list)
        if blurred_image is None:
            raise HTTPException(status_code=500, detail="Failed to blur image")
        
        # Convert PIL Image to bytes
        img_byte_arr = io.BytesIO()
        blurred_image.save(img_byte_arr, format='JPEG')
        img_byte_arr = img_byte_arr.getvalue()

        cleanup_old_files()
        
        return Response(
            content=img_byte_arr,
            media_type="image/jpeg"
        )
        
    except ValueError as e:
        logger.error(f"Invalid region format: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid region format")
    except Exception as e:
        logger.error(f"Error in blur_regions: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
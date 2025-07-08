import os
from pathlib import Path
import torch
from transformers import DetrImageProcessor, DetrForObjectDetection, pipeline
from easyocr import Reader
from groq import Groq

# Global variables
device = None
detr_processor = None
detr_model = None
reader = None
groq_client = None
predict = None

def setup_directories(base_dir: Path):
    """Create necessary directories if they don't exist."""
    dirs = ["templates", "static", "temp"]
    for dir_name in dirs:
        (base_dir / dir_name).mkdir(exist_ok=True)

def init_models():
    """Initialize ML models and configurations."""
    global device, detr_processor, detr_model, reader, groq_client, predict
    
    # Setup device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Initialize models
    detr_processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
    detr_model = DetrForObjectDetection.from_pretrained("facebook/detr-resnet-50").to(device)
    reader = Reader(['en'], gpu=torch.cuda.is_available())
    predict = pipeline("image-classification", model="AdamCodd/vit-base-nsfw-detector")
    
    # Initialize Groq client
    api_key = os.getenv("GROQ_API_KEY", "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")
    groq_client = Groq(api_key=api_key)

# Initialize models when the module is imported
init_models()
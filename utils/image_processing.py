import cv2
from PIL import Image
import torch
from config import device, detr_processor, detr_model, reader, groq_client, predict
from pathlib import Path
import os
import numpy as np

def perform_ocr(image_path):
    """Extract text from image using OCR."""
    try:
        results = reader.readtext(image_path)
        return " ".join([res[1] for res in results])
    except Exception as e:
        print(f"Error during OCR processing: {e}")
        return "Error: OCR processing failed"

def annotate_image(image_path):
    # Read image
    image = cv2.imread(image_path)
    if image is None:
        print("Error: Could not read the image file.")
        return
    
    # Perform text detection
    results = reader.readtext(image)
    
    # Annotate the image
    for idx, (bbox, text, confidence) in enumerate(results):
        # Get the bounding box coordinates
        (top_left, top_right, bottom_right, bottom_left) = bbox
        top_left = tuple(map(int, top_left))
        bottom_right = tuple(map(int, bottom_right))
        
        # Draw the bounding box
        cv2.rectangle(image, top_left, bottom_right, (0, 255, 0), 2)
        
        # Add text label
        label = f"{idx + 1}"
        cv2.putText(image, label, (top_left[0], top_left[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 3)
    
    # Save and show the annotated image
    return image

def blur_image(image_path,regions):
    # Read image
    image = cv2.imread(image_path)
    if image is None:
        print("Error: Could not read the image file.")
        return
    
    # Perform text detection
    results = reader.readtext(image)
    
    # Annotate the image
    for idx, (bbox, text, confidence) in enumerate(results):
        if (idx + 1) in regions:
            (top_left, top_right, bottom_right, bottom_left) = bbox
            x_min = int(min(top_left[0], bottom_left[0]))
            y_min = int(min(top_left[1], top_right[1]))
            x_max = int(max(bottom_right[0], top_right[0]))
            y_max = int(max(bottom_right[1], bottom_left[1]))

        # Extract the region of interest (ROI)
            roi = image[y_min:y_max, x_min:x_max]

        # Apply Gaussian blur to the ROI
            blurred_roi = cv2.GaussianBlur(roi, (31, 31), 0)

        # Replace the original ROI with the blurred ROI
            image[y_min:y_max, x_min:x_max] = blurred_roi

    if isinstance(image, np.ndarray):
        return Image.fromarray(image.astype('uint8'))
        
    return image
    

def perform_object_detection(image_path):
    """Detect objects in the image using DETR model."""
    try:
        image = Image.open(image_path)
        inputs = detr_processor(images=image, return_tensors="pt").to(device)
        outputs = detr_model(**inputs)
        results = detr_processor.post_process_object_detection(
            outputs,
            target_sizes=[image.size]
        )[0]
        
        detected_objects = []
        for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
            if score > 0.8:
                detected_objects.append({
                    "label": detr_model.config.id2label[label.item()],
                    "box": box.tolist(),
                    "confidence": score.item()
                })
        return detected_objects
    except Exception as e:
        print(f"Error during object detection: {e}")
        return []

def nsfw_score(image_path):
    img = Image.open(image_path)
    return predict(img)

def nsfw_detection(data):
# Extract scores for 'sfw' and 'nsfw'
    sfw_score = next(item['score'] for item in data if item['label'] == 'sfw')
    nsfw_score = next(item['score'] for item in data if item['label'] == 'nsfw')
# Determine the output
    if sfw_score > nsfw_score:
        return("Image is safe for work.")
    else:
        return("Image is not safe for work.")

    

def process_image(image_path):
    """Process image with all available tools."""
    try:
        # Blur text in image
        blurred_image = annotate_image(image_path)
        file_name = Path(image_path).stem
        blurred_image_path = f"temp/{file_name}_blurred.jpg"
        cv2.imwrite(blurred_image_path, blurred_image)
        
        # Extract text and detect objects
        extracted_text = perform_ocr(image_path)
        detected_objects = perform_object_detection(image_path)
        nsfw_data = nsfw_score(image_path)
        nsfw_text = nsfw_detection(nsfw_data)
       
        
        # Generate analysis using Groq
        analysis = generate_analysis(extracted_text + nsfw_text , detected_objects)
        
        
        return {
            "Blurred Image Path": blurred_image_path,
            "Extracted Metadata": extracted_text,
            "Detected Objects": detected_objects,
            "NSFW Data": str(nsfw_data),
            "Detailed Risk Analysis": analysis
        }
    except Exception as e:
        print(f"Error during image processing: {e}")
        return {"error": f"Image processing failed: {str(e)}"}

def generate_analysis(text, objects):
    """Generate detailed analysis using Groq."""
    try:
        prompt = (
            f"Analyze the following image content:\n\n"
            f"Text Extracted: {text}\n\n"
            f"Objects Detected: {objects}\n\n"
            f"Provide a detailed analysis including:\n"
            f"1. Content description\n"
            f"2. Potential sensitive information\n"
            f"3. Security risks\n"
            f"4. Privacy concerns\n"
            f"5. NSFW Content"
        )

        response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
            max_tokens=4096
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Analysis generation failed: {str(e)}"
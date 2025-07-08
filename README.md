# 👋 Welcome to My GitHub

I focus on building secure, privacy-aware tools powered by AI.  
Here, code does the talking — no overshare, just solutions.

---

## 🚫 NOovershare

**NOovershare** is a privacy-first platform designed to analyze and sanitize images before they’re shared online. It detects risks like personal data, sensitive content, or inappropriate visuals — and helps users prevent unintentional oversharing.

### 🔐 Key Features

- 🎯 **Object Detection** — Identifies faces, documents, credit cards using **DETR**
- 🧾 **Text Extraction** — Pulls text (like addresses or phone numbers) using **EasyOCR**
- 🚫 **NSFW Detection** — Flags explicit content via **AdamCodd**
- 🧠 **Risk Summarization** — Uses **LLaMA** to provide natural-language risk reports
- 🖼️ **Editing Tools** — Crop or blur selected parts of the image before sharing
- 🔒 **End-to-End Encryption** — AES-128 (Fernet) with PBKDF2-HMAC + SHA256
- ⚡ **Groq Integration** — Hardware acceleration for model inference

---

## 🛠️ How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/noovershare.git
cd noovershare
```
2. Set Up a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

3. Install Dependencies

```bash
pip install -r requirements.txt
```

You can adjust versions if you know your project uses different ones.
If you want to generate this file from your current environment, use:
```bash
pip freeze > requirements.txt
```
4. Enable Groq Acceleration
   
    Create a .env file in the root directory:
```bash
    USE_GROQ=True
    GROQ_API_KEY=your_actual_key_here
```
  

6. Start the FastAPI Backend
```bash
uvicorn app.main:app --reload
```

6. Launch the Frontend

Open index.html in your browser to access the image upload, crop, and risk analysis UI.
📎 Tech Stack

    Frontend: HTML, CSS, JavaScript, Cropper.js

    Backend: Python, FastAPI, Uvicorn

    Models: DETR, EasyOCR, AdamCodd, LLaMA

    Crypto: Fernet (AES-128), PBKDF2HMAC, SHA256

    Processing: OpenCV, PIL

    Acceleration: Groq hardware (optional)

🤖 Project Status

Prototype live with all major components integrated.
Supports:

    Drag & drop image uploads

    Region-specific blurring

    Risk summaries

    Encrypted downloads

Further work planned on:

    False-positive tuning in NSFW detection

    Improved OCR on low-res images

    Dockerized deployment

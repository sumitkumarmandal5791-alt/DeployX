from fastapi import FastAPI, UploadFile, File
from preprocess import preprocess_image
from detector import detect_item

app = FastAPI(title="Smart E-Waste Image Detection")

# 1️⃣ IMAGE UPLOAD + DETECTION ENDPOINT
@app.post("/detect")
async def detect_image(file: UploadFile = File(...)):
    image_bytes = await file.read()

    image_np = preprocess_image(image_bytes)
    result = detect_item(image_np)

    return {
        "detected_item": result["item"],
        "confidence_percent": result["confidence"],
        "explanation": result["reason"]
    }


# 2️⃣ CONFIRMATION ENDPOINT (already correct)
@app.post("/confirm")
async def confirm_item(item: str):
    value_map = {
        "mobile phone": (500, 1500),
        "laptop": (1000, 4000),
        "charger": (50, 200),
        "cable": (30, 100),
        "battery": (80, 300)
    }

    min_val, max_val = value_map.get(item, (0, 0))

    return {
        "confirmed_item": item,
        "estimated_value_range": f"₹{min_val} – ₹{max_val}",
        "reward_points": int(max_val / 10),
        "message": "Thank you for recycling responsibly"
    }

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from preprocess import preprocess_image
from detector import detect_item
import io

app = FastAPI(title="Smart E-Waste Image Detection")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for hackathon
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/detect")
async def detect_object(file: UploadFile = File(...)):
    # Read image file
    image_bytes = await file.read()
    
    # Preprocess
    # preprocess_image expects bytes and returns numpy array suitable for clip
    image_tensor = preprocess_image(image_bytes)
    
    # Detect
    result = detect_item(image_tensor)
    
    return result

@app.post("/confirm")
async def confirm_item(item: str):
    # Dummy value mapping (hackathon-safe)
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



from fastapi import FastAPI, UploadFile, File
from preprocess import preprocess_image
from detector import detect_item

app = FastAPI(title="Smart E-Waste Image Detection")

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



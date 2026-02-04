import torch
import clip
from PIL import Image
import numpy as np

device = "cuda" if torch.cuda.is_available() else "cpu"

# Load model ONCE
model, preprocess = clip.load("ViT-B/32", device=device)
model.eval()

LABELS = [
    "battery",
    "mobile phone",
    "laptop",
    "charger",
    "cable"
]

# Tokenize text ONCE
text_tokens = clip.tokenize(
    [f"a photo of a {label}" for label in LABELS]
).to(device)


def detect_item(image_np):
    # image_np: (1, 224, 224, 3)
    image = Image.fromarray((image_np[0] * 255).astype("uint8"))
    image_input = preprocess(image)
    if not isinstance(image_input, torch.Tensor):
        from torchvision.transforms import ToTensor
        image_input = ToTensor()(image_input)
    image_input = image_input.unsqueeze(0).to(device)

    with torch.no_grad():
        image_features = model.encode_image(image_input)
        text_features = model.encode_text(text_tokens)

        similarity = (image_features @ text_features.T).softmax(dim=-1)

    confidence, index = similarity[0].max(dim=0)
    confidence = confidence.item() * 100

    if confidence < 40:
        return {
            "item": "unknown",
            "confidence": round(confidence, 2),
            "reason": "Low semantic similarity"
        }

    return {
        "item": LABELS[index.item()],
        "confidence": round(confidence, 2),
        "reason": "Detected using CLIP semantic similarity"
    }

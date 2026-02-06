import torch
import clip
from PIL import Image
import numpy as np

# ---------------------------------------------------
# Device Setup
# ---------------------------------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"

# ---------------------------------------------------
# Load CLIP Model Once
# ---------------------------------------------------
model, preprocess = clip.load("ViT-B/32", device=device)
model.eval()

# ---------------------------------------------------
# Geometry-Focused Prompts
# ---------------------------------------------------
CLASS_PROMPTS = {

    # ---------------- MOBILE PHONE ----------------
    "mobile phone": [
        "a flat rectangular handheld smartphone with a large glass touchscreen",
        "a slim rigid touchscreen mobile device without keyboard",
        "a modern rectangular phone screen device"
    ],

    # ---------------- LAPTOP ----------------
    "laptop": [
        "an open clamshell laptop computer with visible keyboard and screen",
        "a foldable portable computer larger than a smartphone",
        "a rectangular computer with hinge and keyboard"
    ],

    # ---------------- BATTERY ----------------
    "battery": [
        "a small short cylindrical metal cell with flat circular ends",
        "a compact round tube shaped object with metallic caps",
        "a short solid cylinder object smaller than a charger"
    ],

    # ---------------- CHARGER ----------------
    "charger": [
        "a thick rectangular block with two metal wall plug pins",
        "a solid cube shaped adapter block with prongs",
        "a rigid box shaped object larger than a battery"
    ],

    # ---------------- CABLE ----------------
    "cable": [
        "a long thin flexible cord stretched across a surface",
        "a narrow elongated bendable line shaped object",
        "a soft curved string like object without block or cylinder"
    ],

    # ---------------- NON E-WASTE ----------------
    "non e-waste": [
        "a person or human face",
        "an animal such as dog or cat",
        "furniture like table or chair",
        "a vehicle such as car or bicycle",
        "food items or fruit",
        "books paper or clothing",
        "a random household object that is not electronic equipment"
    ]
}

CLASS_NAMES = list(CLASS_PROMPTS.keys())

# ---------------------------------------------------
# Precompute Text Embeddings
# ---------------------------------------------------
def compute_text_embeddings():
    class_embeddings = []

    with torch.no_grad():
        for class_name in CLASS_NAMES:
            prompts = CLASS_PROMPTS[class_name]
            tokens = clip.tokenize(prompts).to(device)

            embeddings = model.encode_text(tokens)
            embeddings /= embeddings.norm(dim=-1, keepdim=True)

            class_embedding = embeddings.mean(dim=0)
            class_embedding /= class_embedding.norm()

            class_embeddings.append(class_embedding)

    return torch.stack(class_embeddings)

text_features = compute_text_embeddings()

# ---------------------------------------------------
# Detection Function
# ---------------------------------------------------
def detect_item(image_np):
    """
    image_np shape: (1, 224, 224, 3)
    """

    image = Image.fromarray((image_np[0] * 255).astype("uint8"))
    image_input = preprocess(image).unsqueeze(0).to(device)

    with torch.no_grad():
        image_features = model.encode_image(image_input)
        image_features /= image_features.norm(dim=-1, keepdim=True)

        similarity = image_features @ text_features.T

    similarity_scores = similarity[0].cpu().numpy()

    # Debug similarity values
    print("\n--- Similarity Scores ---")
    for name, score in zip(CLASS_NAMES, similarity_scores):
        print(f"{name}: {round(float(score), 4)}")
    print("-------------------------\n")

    best_index = int(np.argmax(similarity_scores))
    best_score = float(similarity_scores[best_index])
    predicted_class = CLASS_NAMES[best_index]

    # Convert cosine similarity (-1 to 1) → percentage scale
    confidence = (best_score + 1) / 2 * 100

    # ---------------------------------------------------
    # Clean Decision Logic
    # ---------------------------------------------------

    # Reject only if similarity extremely low
    if best_score < 0.18:
        return {
            "item": "unknown",
            "confidence": round(confidence, 2),
            "reason": "Low similarity to known categories"
        }

    # Handle non e-waste separately
    if predicted_class == "non e-waste":
        return {
            "item": "non e-waste",
            "confidence": round(confidence, 2),
            "reason": "Detected as non electronic waste"
        }

    # Accept highest similarity class
    return {
        "item": predicted_class,
        "confidence": round(confidence, 2),
        "reason": "Detected using cosine similarity (CLIP)"
    }

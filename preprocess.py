import cv2
import numpy as np

IMAGE_SIZE = 224

def preprocess_image(image_bytes):
    # Convert bytes → numpy array
    image_array = np.frombuffer(image_bytes, np.uint8)

    # Decode image
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    # Convert BGR → RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Resize to model input size
    image = cv2.resize(image, (IMAGE_SIZE, IMAGE_SIZE))

    # Normalize
    image = image / 255.0

    # Add batch dimension
    image = np.expand_dims(image, axis=0)

    return image

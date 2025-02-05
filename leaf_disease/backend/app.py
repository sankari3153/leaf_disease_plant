import json
import numpy as np
from PIL import Image
from io import BytesIO
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Load your trained TensorFlow model and related data
model = tf.keras.models.load_model("C:\\Users\\acer\\Desktop\\leaf_disease\\backend\\trained_model\\plant_disease_model.h5")

# Load class indices and disease descriptions (for predictions)
with open("C:\\Users\\acer\\Desktop\\leaf_disease\\backend\\class_indices.json", "r") as f:
    class_indices = json.load(f)

with open("C:\\Users\\acer\\Desktop\\leaf_disease\\backend\\disease_descriptions.json", "r") as f:
    disease_descriptions = json.load(f)

# Preloaded results as fallback data
preloaded_results = [
    {
        "classification": "Leaf Scald",
        "probability": 0.92,
        "description": "Leaf Scald is a disease caused by Xanthomonas albilineans affecting sugarcane.",
        "symptoms": "Yellowing of leaf tips, necrosis, and wilting.",
        "causes": "Caused by bacterial infection during high humidity.",
    },
    {
        "classification": "Rust",
        "probability": 0.87,
        "description": "Rust is a fungal disease caused by Puccinia melanocephala.",
        "symptoms": "Orange-brown pustules on leaves, reduced growth.",
        "causes": "Spread through fungal spores in damp environments.",
    },
]

# FastAPI app initialization
app = FastAPI()

# CORS middleware for allowing frontend React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Function to preprocess the image before passing it to the model
def load_and_preprocess_image(image_bytes):
    img = Image.open(BytesIO(image_bytes)).convert("RGB")  # Ensure the image is in RGB format
    img = img.resize((150, 150))  # Resize to match your model's expected input
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    img_array = img_array.astype('float32') / 255.0  # Normalize image
    return img_array

# Function to predict the image class based on model's prediction
def predict_image_class(image_bytes):
    preprocessed_img = load_and_preprocess_image(image_bytes)
    predictions = model.predict(preprocessed_img)  # Model prediction
    predicted_class_index = np.argmax(predictions, axis=1)[0]  # Get index of max prediction
    predicted_class_name = class_indices.get(str(predicted_class_index), "Unknown")  # Map index to class name
    predicted_probability = float(predictions[0][predicted_class_index])  # Prediction probability as float
    return predicted_class_name, predicted_probability

# Combined endpoint to classify the disease and return all details
@app.post("/classify_all")
async def classify_all(file: UploadFile = File(...)):
    try:
        contents = await file.read()  # Read file contents
        predicted_class, predicted_probability = predict_image_class(contents)  # Predict class and probability
        disease_info = disease_descriptions.get(predicted_class, {
            "description": "No description available.",
            "symptoms": "No symptoms available.",
            "causes": "No causes available."
        })

        # Return classification, probability, and disease info
        return JSONResponse(content={
            "classification": predicted_class,
            "probability": predicted_probability,
            "description": disease_info["description"],
            "symptoms": disease_info["symptoms"],
            "causes": disease_info["causes"]
        })
    except Exception as e:
        print(f"Error in classify_all endpoint: {e}")
        # Return preloaded results when an error occurs
        return JSONResponse(content={"preloaded_results": preloaded_results}, status_code=200)

# Run the FastAPI server with Uvicorn
if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True, log_level="debug")

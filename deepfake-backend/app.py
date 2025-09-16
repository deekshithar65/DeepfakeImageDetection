from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS  # Allow frontend (React) to communicate with backend
import os
from werkzeug.utils import secure_filename  # Helps prevent malicious file names
from model.deepfake_model import DeepfakeDetector  # Custom deepfake detection model

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing (important for frontend-backend communication)

# Define folder paths for uploads and outputs
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")   # Where -uploaded files are stored
OUTPUT_FOLDER = os.path.join(BASE_DIR, "outputs")   # Where processed outputs (e.g., heatmaps) are stored

# Ensure these folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Load the deepfake detection model
detector = DeepfakeDetector()

# Allowed image extensions
ALLOWED_EXTENSIONS = {"jpg", "png", "jpeg"}

# Helper function to check if a file is allowed
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Root route (for quick health check)
@app.route("/")
def home():
    return jsonify({"message": "✅ Backend is running! Use /api/detect/image to upload files."})

# API route for detecting deepfakes in uploaded images
@app.route("/api/detect/image", methods=["POST"])
def detect_image():
    # Validate if request contains a file
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    # Check if filename is empty
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    # Validate file type
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    # Secure the filename and save the uploaded file
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    print("📂 File uploaded:", filepath)

    try:
        # Ensure the model has the required method
        if not hasattr(detector, "predict_with_heatmap"):
            return jsonify({"error": "Model method predict_with_heatmap not found"}), 500

        # Run prediction and generate heatmap
        label, confidence, heatmap_path = detector.predict_with_heatmap(filepath, OUTPUT_FOLDER)
        print(f"✅ Prediction: {label}, {confidence}, heatmap: {heatmap_path}")

    except Exception as e:
        # Handle any model-related errors gracefully
        print("❌ Model prediction error:", str(e))
        return jsonify({"error": "Model prediction failed", "details": str(e)}), 500

    # Return prediction results as JSON
    return jsonify({
        "label": label,  # Predicted class: "real" or "fake"
        "confidence": float(confidence),  # Confidence score (0.0 - 1.0)
        "heatmap": f"/outputs/{os.path.basename(heatmap_path)}" if heatmap_path else None  # Heatmap path (if available)
    })

# Route for serving generated heatmap images
@app.route("/outputs/<path:filename>")
def serve_output(filename):
    return send_from_directory(OUTPUT_FOLDER, filename)

# Run Flask app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import os
import cv2
import base64
from werkzeug.utils import secure_filename
from collections import Counter

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
RESULT_FOLDER = "results"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

# Better accuracy than yolov8n.pt
# First run will download this model automatically
model = YOLO("yolov8m.pt")


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Backend is running successfully"})


@app.route("/detect", methods=["POST"])
def detect():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]

        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        filename = secure_filename(file.filename)
        image_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(image_path)

        # Lower confidence + bigger image size = detects more small objects
        results = model(
            image_path,
            conf=0.20,
            imgsz=960
        )

        detected_objects = []

        for box in results[0].boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            name = model.names[class_id]

            detected_objects.append({
                "name": name,
                "confidence": round(confidence * 100, 2)
            })

        object_counts = dict(Counter([obj["name"] for obj in detected_objects]))

        annotated_image = results[0].plot()

        result_path = os.path.join(RESULT_FOLDER, "detected_" + filename)
        cv2.imwrite(result_path, annotated_image)

        with open(result_path, "rb") as img_file:
            encoded_image = base64.b64encode(img_file.read()).decode("utf-8")

        return jsonify({
            "image": encoded_image,
            "objects": detected_objects,
            "counts": object_counts,
            "total": len(detected_objects)
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
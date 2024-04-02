import numpy, cv2, base64, io, onnxruntime, os, json
from PIL import Image
from typing import List
from dataclasses import dataclass
from smart_open import open
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

def db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_DBNAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )

@dataclass
class BBOX:
    left: int
    top: int
    width: int
    height: int

@dataclass
class Prediction:
    class_name: int
    confidence: float
    box: BBOX

    def to_dict(self):
        return {
            "class_name": str(self.class_name),
            "confidence": float(self.confidence),
            "box": {
                "left": int(self.box.left),
                "top": int(self.box.top),
                "width": int(self.box.width),
                "height": int(self.box.height),
            },
        }


class Model:
    def __init__(self, model_name: str):
        self.model_name = model_name
        providers = onnxruntime.get_available_providers()
        print(f"Available providers: {providers}")
        self.model = onnxruntime.InferenceSession(
            f"models/{model_name}.onnx", providers=providers
        )
        self.input_name = self.model.get_inputs()[0].name
        self.output_name = self.model.get_outputs()[0].name
        self.input_width = self.model.get_inputs()[0].shape[2]
        self.input_height = self.model.get_inputs()[0].shape[3]
        self.idx2class = eval(self.model.get_modelmeta().custom_metadata_map["names"])

    def preprocess(self, img: Image.Image) -> numpy.ndarray:
        img = img.resize((self.input_width, self.input_height))
        img = numpy.array(img).transpose(2, 0, 1)
        img = numpy.expand_dims(img, axis=0)
        img = img / 255.0
        img = img.astype(numpy.float32)
        return img

    def postprocess(
        self,
        output: numpy.ndarray,
        confidence_thresh: float,
        iou_thresh: float,
        img_width: int,
        img_height: int,
    ) -> List[Prediction]:

        outputs = numpy.transpose(numpy.squeeze(output[0]))
        rows = outputs.shape[0]
        boxes = []
        scores = []
        class_ids = []
        x_factor = img_width / self.input_width
        y_factor = img_height / self.input_height
        for i in range(rows):
            classes_scores = outputs[i][4:]
            max_score = numpy.amax(classes_scores)
            if max_score >= confidence_thresh:
                class_id = numpy.argmax(classes_scores)
                x, y, w, h = outputs[i][0], outputs[i][1], outputs[i][2], outputs[i][3]
                left = int((x - w / 2) * x_factor)
                top = int((y - h / 2) * y_factor)
                width = int(w * x_factor)
                height = int(h * y_factor)
                class_ids.append(class_id)
                scores.append(max_score)
                boxes.append([left, top, width, height])
        indices = cv2.dnn.NMSBoxes(boxes, scores, confidence_thresh, iou_thresh)
        detections = []
        if len(indices) > 0:
            for i in indices.flatten():
                left, top, width, height = boxes[i]
                class_id = class_ids[i]
                score = scores[i]
                detection = Prediction(
                    class_name=self.idx2class[class_id],
                    confidence=score,
                    box=BBOX(left, top, width, height),
                )
                detections.append(detection)
        return detections

    def __call__(
        self, img: Image.Image, confidence_thresh: float, iou_thresh: float
    ) -> List[Prediction]:
        img_input = self.preprocess(img)
        outputs = self.model.run(None, {self.input_name: img_input})
        predictions = self.postprocess(
            outputs, confidence_thresh, iou_thresh, img.width, img.height
        )
        return predictions

model = Model("yolov8s")

@app.route("/ping", methods=["GET"])
def ping():
    return "pong"

@app.route("/detect", methods=["POST"])
def detect():
    file_time = request.json["file_time"]
    file_name = request.json["file_name"]
    image_info = request.json["image_info"]
    confidence = request.json["confidence"]
    iou = request.json["iou"]
    image_format = request.json["format"]
    if image_format == "path":
        with open(image_info, "rb") as fh:
            original_img = Image.open(fh)
    elif image_format == "b64":
        img_bytes = base64.b64decode(str(image_info))
        original_img = Image.open(io.BytesIO(img_bytes))
    else:
        return []
    original_img = original_img.convert("RGB")
    predictions = model(original_img, confidence, iou)
    detections = [p.to_dict() for p in predictions]
    def db_send_prediction():
        try:
            with db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO video_analyses (file_time, file_name, input_confidence, input_iou, model, predictions) 
                        VALUES (%s, %s, %s, %s, %s, %s);
                    """, (file_time, file_name, confidence, iou, model.model_name, json.dumps(detections)))
                conn.commit()
        except Exception as ex:
            conn.rollback()
            raise ex
        return
    if(file_time >= 0):
        db_send_prediction()
    return jsonify(detections)


@app.route("/model_check", methods=["GET"])
def model_check():
    if model is None:
        return ["No model is loaded", False]
    return jsonify([model.model_name, True])

@app.route("/load_model", methods=["POST"])
def load_model():
    global model
    model_name = request.json["model_name"]
    model = Model(model_name)
    return f"Model loaded successfully: {model_name}"


@app.route("/models_list", methods=["GET"])
def models_list():
    return jsonify(["yolov8n", "yolov8s"])

if __name__ == "__main__":
    app.run(host=os.getenv("HOST"), port=os.getenv("PORT"))


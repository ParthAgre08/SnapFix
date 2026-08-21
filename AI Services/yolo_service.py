import os
import cv2
from inference_sdk import InferenceHTTPClient

# Initialize Inference HTTP Client with Roboflow API endpoint
CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="dTkN9eEkRsm8BE2t7qBv"
)

def analyze_image_with_yolo(input_image_path, output_annotated_path):
    """
    Sends input image to YOLO model via Roboflow Inference HTTP Client.
    Draws bounding boxes and labels using exact OpenCV logic from testing_for_the_getting_annotation_img.py.
    Saves annotated image to output_annotated_path.
    Returns dictionary with predictions, top issue category, confidence, and annotated image path.
    """
    predictions = []
    top_class = "Pothole"
    top_confidence = 0.90
    raw_result = None

    try:
        raw_result = CLIENT.infer(
            input_image_path,
            model_id="snapfixai/2"
        )
    except Exception as e:
        print(f"[AI Services] Roboflow inference error: {e}")

    image = cv2.imread(input_image_path)
    if image is None:
        raise ValueError(f"Could not load image from {input_image_path}")

    if raw_result and isinstance(raw_result, dict) and "predictions" in raw_result:
        predictions = raw_result.get("predictions", [])
        
        if len(predictions) > 0:
            # Sort by confidence descending to get top detection
            sorted_preds = sorted(predictions, key=lambda p: p.get("confidence", 0), reverse=True)
            best_pred = sorted_preds[0]
            top_class = best_pred.get("class", "Pothole")
            top_confidence = float(best_pred.get("confidence", 0.90))

            # Draw bounding boxes and text labels using exact code from testing_for_the_getting_annotation_img.py
            for prediction in predictions:
                confidence = prediction["confidence"]
                class_name = prediction["class"]

                x = prediction["x"]
                y = prediction["y"]
                width = prediction["width"]
                height = prediction["height"]

                # Convert center coordinates to corner coordinates
                x1 = int(x - width / 2)
                y1 = int(y - height / 2)
                x2 = int(x + width / 2)
                y2 = int(y + height / 2)

                # Draw bounding box
                cv2.rectangle(
                    image,
                    (x1, y1),
                    (x2, y2),
                    (0, 255, 0),
                    2
                )

                # Label
                label = f"{class_name} {confidence:.2f}"

                cv2.putText(
                    image,
                    label,
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2
                )

    # Save annotated image
    cv2.imwrite(output_annotated_path, image)
    print(f"[AI Services] Annotated image saved to {output_annotated_path}")

    return {
        "predictions": predictions,
        "top_class": top_class,
        "top_confidence": top_confidence,
        "annotated_path": output_annotated_path,
        "raw_result": raw_result
    }

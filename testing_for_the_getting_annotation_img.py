from inference_sdk import InferenceHTTPClient
import cv2

CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="dTkN9eEkRsm8BE2t7qBv"
)

result = CLIENT.infer(
    "garbage.jpg",
    model_id="snapfixai/2"
)

image = cv2.imread("garbage.jpg")

for prediction in result["predictions"]:

    confidence = prediction["confidence"]

    # if confidence < 0.5:
    #     continue

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

cv2.imwrite("annotated.jpg", image)

print("Annotated image saved as annotated.jpg")
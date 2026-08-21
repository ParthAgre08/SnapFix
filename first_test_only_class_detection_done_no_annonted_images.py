from inference_sdk import InferenceHTTPClient

CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="dTkN9eEkRsm8BE2t7qBv"
)

result = CLIENT.infer(
    "garbage.jpg",
    model_id="snapfixai/2"
)

print(result)
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import requests

app = FastAPI()
INPUT_DIR = os.getenv("INPUT_DIR")
CONVERTER_PORT = os.getenv("CONVERTER_PORT")
CONVERTER_URL = f"http://converter:{CONVERTER_PORT}"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/file")
async def post_file(file: UploadFile = File(...)):
    filename = file.filename
    print(f"Received file: {filename}")
    contents = await file.read()

    filepath = os.path.join(INPUT_DIR, filename)
    print(f"Saving file to: {filepath}")
    with open(filepath, "wb") as f:
        f.write(contents)
    print(f"File saved successfully: {filepath}")
    payload = {"filepath": filepath}
    print(f"Sending payload to converter service: {payload}")
    try:
        response = requests.post(f"{CONVERTER_URL}/input_dir", json=payload)
        response.raise_for_status()
    except requests.RequestException as e:
        return {"message": f"File saved, but converter service error: {str(e)}", 
                "file": ""}
    return {"output_file": response.json().get("output_file", "")}
    

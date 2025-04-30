from fastapi import FastAPI, Request
import requests
import subprocess
import os

OUTPUT_DIR = os.getenv("OUTPUT_DIR")

app = FastAPI()

@app.get("/")
async def hello():
    return {"Hello": "World"}

@app.post("/input_dir")
async def upload_input_dir(request: Request):
    data = await request.json()

    ifc_filepath = data.get("filepath")
    if not ifc_filepath:
        return {"error": "No filepath provided"}
    
    ifc_filename = os.path.basename(ifc_filepath)
    output_filepath = os.path.join(OUTPUT_DIR, ifc_filename)

    return {
        "status": "success",
            "input_file": ifc_filepath,
            "output_file": output_filepath,
    }
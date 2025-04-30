from fastapi import FastAPI, Request
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
    base_name = os.path.splitext(ifc_filename)[0]
    output_filename = f"{base_name}.glb"

    output_filepath = os.path.join(OUTPUT_DIR, output_filename)

    try:
        result = subprocess.run(
            ["IfcConvert", ifc_filepath, output_filepath], 
            capture_output=True, 
            text=True, 
            check=True
        )
        return {
        "status": "success",
            "input_file": ifc_filepath,
            "output_file": output_filepath,
            "message": result.stdout
        }
    except subprocess.CalledProcessError as e:
        return {
            "status": "error",
            "message": e.stderr,
            "error_code": e.returncode
        }
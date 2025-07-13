from fastapi import FastAPI, UploadFile, File
from backend.process_file import *
import shutil
import uuid
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import Request

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # adjust based on your frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/midi-files", StaticFiles(directory="midi_output"), name="midi-files")
app.state.model = tf.keras.models.load_model("prediction_model/best_model.keras")

@app.post("/upload")
async def upload_file(request:Request, file: UploadFile = File(...)):
    # Save to a temp file
    temp_filename = f"backend\\temporary_audio_files\\temp_{uuid.uuid4().hex}.wav"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Process the file
    model = request.app.state.model
    midi_path = generate_midi(temp_filename, model = model)
    midi_filename = os.path.basename(midi_path)

    return {"midi_url": f"/midi-files/{midi_filename}"}
import os
import numpy as np
import librosa
import soundfile as sf
import tensorflow as tf
from madmom.features.onsets import OnsetPeakPickingProcessor, OnsetDetection
from scipy.io import wavfile

# Load model
model = tf.keras.models.load_model("best_model.keras")

# Convert to WAV and 16kHz mono
def convert_to_wav(input_path, output_path, target_sr=16000):
    y, sr = librosa.load(input_path, sr=target_sr, mono=True)
    sf.write(output_path, y, target_sr)

# Detect onsets using madmom
def detect_onsets(wav_path):
    odf = OnsetDetection(wav_path)
    proc = OnsetPeakPickingProcessor(threshold=0.5, fps=100)
    onsets = proc(odf)
    return onsets  # in seconds

# Extract fixed-length audio chunks from onsets
def extract_segments(y, sr, onsets):
    segments = []
    for i, t in enumerate(onsets):
        start = int(t * sr)

        if i < len(onsets) - 1:
            next_t = onsets[i + 1]
            gap = next_t - t
            duration = min(max(0.2, gap), 0.5)
            end = start + int(duration * sr)
        else:
            end = len(y)  # last segment goes till the end

        segment = y[start:end]
        # if len(segment) > int(0.1 * sr):  # Optional: skip very tiny segments
        #     segments.append(segment)

    return segments

# Convert audio to mel spectrogram
def audio_to_mel(audio, sr=16000, n_fft=2048, hop_length=256, n_mels=128, target_frames=24):
    audio = librosa.util.normalize(audio)
    mel = librosa.feature.melspectrogram(y=audio, sr=sr, n_fft=n_fft, hop_length=hop_length, n_mels=n_mels)
    mel_db = librosa.power_to_db(mel, ref=np.max)
    mel_db = (mel_db + 80) / 80
    if mel_db.shape[1] < target_frames:
        mel_db = np.pad(mel_db, ((0, 0), (0, target_frames - mel_db.shape[1])), mode='constant')
    else:
        mel_db = mel_db[:, :target_frames]
    return mel_db.astype(np.float32)

# Predict from file
def predict_from_audio(input_audio_path):
    temp_wav = "temp.wav"
    convert_to_wav(input_audio_path, temp_wav)
    y, sr = librosa.load(temp_wav, sr=16000)
    onsets = detect_onsets(temp_wav)

    segments = extract_segments(y, sr, onsets)
    mels = [audio_to_mel(seg, sr) for seg in segments]
    mels = np.array(mels)[..., np.newaxis]  # shape (N, 128, 24, 1)

    octave_preds, offset_preds = model.predict(mels)
    octave_labels = np.argmax(octave_preds, axis=1)
    offset_labels = np.argmax(offset_preds, axis=1)

    pitches = octave_labels * 12 + offset_labels
    return pitches, onsets

# predict_from_audio("test.mp3")




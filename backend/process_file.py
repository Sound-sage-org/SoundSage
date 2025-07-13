#pipeline:
#get audio array -> detect onsets -> remove duplicate onsets -> extract segments -> convert to mel spectrograms -> prediction
#after prediction -> get audio end times -> get velocities -> convert to midi

import os
import uuid
import numpy as np
import librosa
import soundfile as sf
import tensorflow as tf
from scipy.io import wavfile
import noisereduce as nr
import matplotlib.pyplot as plt
import pretty_midi
# from madmom.features.onsets import OnsetPeakPickingProcessor, OnsetDetection

def show_preprocessed_mel(mel, sr=16000, hop_length=512):
    plt.figure(figsize=(6, 3))
    plt.imshow(mel.squeeze(), origin='lower', aspect='auto', cmap='magma')
    plt.title("Preprocessed Mel Spectrogram")
    plt.xlabel("Time frames")
    plt.ylabel("Mel bins")
    plt.colorbar(label='Normalized Power (0-1)')
    plt.tight_layout()
    plt.show()

def get_audio_array(input_path, output_path, target_sr=16000):
    y, sr = librosa.load(input_path, sr=target_sr, mono=True)
    y_denoised = nr.reduce_noise(y=y, sr=sr)
    # print(len(y_denoised))
    sf.write(output_path, y_denoised, target_sr)

def detect_onsets(wav_path):
    y, sr = librosa.load(wav_path, sr=16000)
    onsets = librosa.onset.onset_detect(y=y, sr=sr, units='time', backtrack=True)
    # print(onsets)
    return onsets

def remove_duplicate_onsets(onsets, min_gap=0.05):
    filtered = []
    last = -np.inf
    for t in onsets:
        if t - last > min_gap:
            filtered.append(t)
            last = t
    return np.array(filtered)

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
        segments.append(segment)
    # print(segments)
    return segments

def audio_to_mel(audio, sr=16000, n_fft=2048, hop_length=256, n_mels=128, target_frames=24):
    audio = librosa.util.normalize(audio)
    mel = librosa.feature.melspectrogram(y=audio, sr=sr, n_fft=n_fft, hop_length=hop_length, n_mels=n_mels)
    mel_db = librosa.power_to_db(mel, ref=np.max)
    mel_db = (mel_db + 80) / 80
    if mel_db.shape[1] < target_frames:
        mel_db = np.pad(mel_db, ((0, 0), (0, target_frames - mel_db.shape[1])), mode='constant')
    else:
        mel_db = mel_db[:, :target_frames]

    # show_preprocessed_mel(mel_db)
    return mel_db.astype(np.float32)

def predict_from_audio(input_audio_path, model):
    temp_wav = "backend\\temporary_audio_files\\temp.wav"
    get_audio_array(input_audio_path, temp_wav)
    y, sr = librosa.load(temp_wav, sr=16000)
    onsets = detect_onsets(temp_wav)
    onsets = remove_duplicate_onsets(onsets)
    segments = extract_segments(y, sr, onsets)
    if len(segments) == 0:
        return [],[]
    mels = [audio_to_mel(seg, sr) for seg in segments]
    mels = np.array(mels)[..., np.newaxis]  # shape (N, 128, 24, 1)

    octave_preds, offset_preds = model.predict(mels)
    octave_labels = np.argmax(octave_preds, axis=1)
    offset_labels = np.argmax(offset_preds, axis=1)

    pitches = octave_labels * 12 + offset_labels
    return y, sr, pitches, onsets

def detect_note_durations_and_velocities(audio, sr, onsets, pitches, max_duration=1.0, threshold_ratio=0.3, hop_length=512, gain_factor=8.5):
    audio = librosa.util.normalize(audio)

    rms = librosa.feature.rms(y=audio, frame_length=2048, hop_length=hop_length).flatten()
    total_frames = len(rms)
    max_frames = int(max_duration * sr / hop_length)

    durations = []
    velocities = []

    for i, onset_time in enumerate(onsets):
        onset_frame = librosa.time_to_frames(onset_time, sr=sr, hop_length=hop_length)
        pitch = pitches[i]

        if onset_frame >= total_frames:
            durations.append(0.1)
            velocities.append(1)
            continue

        peak = rms[onset_frame]
        if peak <= 0:
            peak = 1e-6
        log_rms = np.log1p(peak)

        pitch_bias = 1.5 if pitch < 40 else (1.2 if pitch < 55 else 1.0)

        velocity = int(min(127, max(70, log_rms * 127 * gain_factor * pitch_bias)))

        note_duration = max_duration
        for j in range(max_frames):
            idx = onset_frame + j
            if idx >= total_frames:
                break
            if rms[idx] < threshold_ratio * peak:
                note_duration = j * hop_length / sr
                break

        if note_duration < 0.05:
            continue

        durations.append(note_duration)
        velocities.append(velocity)

    return durations, velocities

def generate_midi(file_path, model, output_dir="midi_output", program=0):
    y, sr, pitches, onsets = predict_from_audio(file_path, model)
    durations, velocities = detect_note_durations_and_velocities(y, sr, onsets, pitches)

    pm = pretty_midi.PrettyMIDI()
    instrument = pretty_midi.Instrument(program=program)

    for pitch, onset, duration, velocity in zip(pitches, onsets, durations, velocities):
        midi_pitch = int(np.clip(pitch + 21, 21, 108))

        note = pretty_midi.Note(
            velocity=velocity,
            pitch=midi_pitch,
            start=onset,
            end=onset + duration
        )
        instrument.notes.append(note)

    pm.instruments.append(instrument)

    os.makedirs(output_dir, exist_ok=True)
    output_filename = f"{uuid.uuid4().hex}.mid"
    output_path = os.path.join(output_dir, output_filename)
    
    pm.write(output_path)
    return output_path

# for testing:
# if __name__ == "__main__":
#     generate_midi("backend\\test2.wav")

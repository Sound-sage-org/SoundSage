#pipeline:
#get audio array -> detect onsets -> remove duplicate onsets -> extract segments -> convert to mel spectrograms -> prediction
#after prediction -> get audio end times -> get velocities -> convert to midi

import os
import uuid
import numpy as np
import librosa
import librosa.display
import soundfile as sf
import tensorflow as tf
from scipy.io import wavfile
import noisereduce as nr
import matplotlib.pyplot as plt
import pretty_midi
from scipy.ndimage import median_filter
# from madmom.features.onsets import OnsetPeakPickingProcessor, OnsetDetection

def plot_onsets(y, sr, onsets, save_path="plots/onsets.png"):
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    plt.figure(figsize=(10, 3))
    librosa.display.waveshow(y, sr=sr)
    for o in onsets:
        plt.axvline(x=o, color='r', linestyle='--')
    plt.title("Detected Onsets")
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

def plot_onset_diagnostics(y, sr , onsets, save_path="plots/onset_diagnostics.png"):
    hop_length = 256
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length)
    times = librosa.times_like(onset_env, sr=sr, hop_length=hop_length)

    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    fig, ax = plt.subplots(2, 1, figsize=(12, 6), sharex=True)

    # Waveform plot
    librosa.display.waveshow(y, sr=sr, ax=ax[0])
    for onset in onsets:
        ax[0].axvline(x=onset, color='r', linestyle='--')
    ax[0].set_title('Waveform with Detected Onsets')

    # Onset strength plot
    ax[1].plot(times, onset_env, label='Onset Strength Envelope')
    for onset in onsets:
        ax[1].axvline(x=onset, color='r', linestyle='--')
    ax[1].legend()
    ax[1].set_title('Onset Strength Envelope')

    plt.xlabel("Time (s)")
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

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
    y = nr.reduce_noise(y=y, sr=sr)
    # print(len(y_denoised))
    sf.write(output_path, y, target_sr)

def filter_by_energy(y, sr, onsets, threshold=0.01, frame_length=2048, hop_length=512):
    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length).flatten()
    times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)
    valid_onsets = []

    for t in onsets:
        idx = np.searchsorted(times, t)
        if idx < len(rms) and rms[idx] > threshold:
            valid_onsets.append(t)

    return np.array(valid_onsets)

def filter_low_energy_onsets(y, sr, onsets, hop_length=256, frame_length=2048, rms_threshold=0.012):
    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length).flatten()
    times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)
    
    filtered = []
    for t in onsets:
        idx = np.searchsorted(times, t)
        if idx < len(rms) and rms[idx] >= rms_threshold:
            filtered.append(t)
    return np.array(filtered)

def detect_onsets(wav_path):
    y, sr = librosa.load(wav_path, sr=16000)

    hop_length = 256
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length)

    onsets = librosa.onset.onset_detect(
        onset_envelope=onset_env,
        sr=sr,
        hop_length=hop_length,
        units='time',
        backtrack=False,       # keeps it from jumping early
        pre_max=3,
        post_max=3,
        pre_avg=8,
        post_avg=8,
        delta=0.05,            # reduced threshold: catch all strong peaks
        wait=1                 # allow very quick notes (good for riffs)
    )

    return onsets

def remove_duplicate_onsets(onsets, min_gap=0.025):
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

    mean_rms = np.mean(librosa.feature.rms(y=y).flatten())
    threshold = 0.3 * mean_rms
    onsets = filter_low_energy_onsets(y, sr, onsets, rms_threshold=threshold)

    onsets = remove_duplicate_onsets(onsets, min_gap=0.07)


    segments = extract_segments(y, sr, onsets)
    if len(segments) == 0:
        return [], [], [], []

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
    plot_onset_diagnostics(y,sr,onsets)
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

import * as Tone from "tone";
import { Midi } from "@tonejs/midi";

const NOTE_NAMES = [
  "A0", "C1", "Eb1", "Gb1", "A1",
  "C2", "Eb2", "Gb2", "A2",
  "C3", "Eb3", "Gb3", "A3",
  "C4", "Eb4", "Gb4", "A4",
  "C5", "Eb5", "Gb5", "A5",
  "C6", "Eb6", "Gb6", "A6",
  "C7", "Eb7", "Gb7", "A7",
  "C8"
];

async function getValidSamplerUrls(baseUrl) {
  const urls = {};
  for (const note of NOTE_NAMES) {
    const filename = `${note}.mp3`;
    const fullUrl = `${baseUrl}${filename}`;
    try {
      const res = await fetch(fullUrl, { method: "HEAD" });
      if (res.ok) {
        urls[note] = filename;
      }
    } catch {
      console.warn(`Failed to load: ${filename}`);
    }
  }
  return urls;
}

export const loadAndPlayMidi = async (midiUrl, instrument, setLIGHTARR, setSampler, setStartTime) => {
  const fullUrl = `http://localhost:8000${midiUrl}`;
  const response = await fetch(fullUrl);
  const arrayBuffer = await response.arrayBuffer();
  const midi = new Midi(arrayBuffer);

  const songArr = midi.tracks.flatMap(track =>
    track.notes.map(note => ({
      time: note.time,
      duration: note.duration,
      pitch: note.name,
      velocity: note.velocity
    }))
  );

  setLIGHTARR(songArr.map(note => ({
    name: note.pitch,
    duration: note.duration * 1000,
    time: note.time,
  })));

  const Instrument = instrument === "Select an option" ? "acoustic_grand_piano" : instrument;
  const baseUrl = `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${Instrument}-mp3/`;
  const urls = await getValidSamplerUrls(baseUrl);

  const sampler = new Tone.Sampler({
    urls,
    baseUrl,
    release: 1,
  }).toDestination();

  await Tone.loaded();

  setSampler(sampler);
  const now = Tone.now();
  setStartTime(performance.now());

  songArr.forEach(note => {
    sampler.triggerAttackRelease(note.pitch, note.duration, now + note.time, note.velocity);
  });
};

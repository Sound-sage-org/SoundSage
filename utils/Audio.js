import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { NavItem } from "react-bootstrap";

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
const noteNext = {
  "A":"B",
  "B":"C",
  "C":"D",
  "D":"E",
  "E":"F",
  "F":"G",
  "G":"A"
};

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

// Create sampler for specific instrument
export const createSampler = async (instrument = "acoustic_grand_piano") => {
  const instrumentName = instrument === "Select Instrument" ? "acoustic_grand_piano" : instrument;
  const baseUrl = `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${instrumentName}-mp3/`;
  
  try {
    const urls = await getValidSamplerUrls(baseUrl);
    
    const sampler = new Tone.Sampler({
      urls,
      baseUrl,
      release: 1,
      attack: 0.1,
    }).toDestination();

    // Wait for all samples to load
    await Tone.loaded();
    
    return sampler;
  } catch (error) {
    console.error("Error creating sampler:", error);
    return null;
  }
};
const getnotenameparsed = (name)=>{
  if(name.length !== 3) return name
  else{
    return noteNext[name[0]]+"b"+name[2]
  } 
}
// Parse MIDI file and extract note data
export const parseMidiFile = async (midiUrl) => {
  try {
    const fullUrl = `http://localhost:8000${midiUrl}`;
    const response = await fetch(fullUrl);
    const arrayBuffer = await response.arrayBuffer();
    const midi = new Midi(arrayBuffer);

    const songArr = midi.tracks.flatMap(track =>
      track.notes.map(note => ({
        time: note.time,
        duration: note.duration * 1000, // Convert to milliseconds
        name: getnotenameparsed(note.name),
        pitch: note.name,
        velocity: note.velocity,
        midi: note.midi
      }))
    );

    // Sort by time for proper playback order
    songArr.sort((a, b) => a.time - b.time);

    return songArr;
  } catch (error) {
    console.error("Error parsing MIDI file:", error);
    return [];
  }
};

// Legacy function for backward compatibility
export const loadAndPlayMidi = async (midiUrl, instrument, setLIGHTARR, setSampler, setStartTime) => {
  try {
    // Parse MIDI file
    const songArr = await parseMidiFile(midiUrl);
    
    // Set the parsed data
    setLIGHTARR(songArr);

    // Create sampler if needed
    const sampler = await createSampler(instrument);
    setSampler(sampler);

    //console.log(`Loaded ${songArr.length} notes for instrument: ${instrument}`);
    
    return { songArr, sampler };
  } catch (error) {
    console.error("Error in loadAndPlayMidi:", error);
    return { songArr: [], sampler: null };
  }
};
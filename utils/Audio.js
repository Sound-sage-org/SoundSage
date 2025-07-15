import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
const NOTE_NAMES = ["A0",
                    "C1", "Eb1", "Gb1", "A1",
                    "C2", "Eb2", "Gb2", "A2",
                    "C3", "Eb3", "Gb3", "A3",
                    "C4", "Eb4", "Gb4", "A4", 
                    "C5", "Eb5", "Gb5", "A5",
                    "C6", "Eb6", "Gb6", "A6",
                    "C7", "Eb7", "Gb7", "A7",
                    "C8"];
// const notes = ["C0", "D#0", "F#0", "A0",
//                 "C1", "D#1", "F#1", "A1",
//                 "C2", "D#2", "F#2", "A2",
//                 "C3", "D#3", "F#3", "A3",
//                 "C4", "D#4", "F#4", "A4", 
//                 "C5", "D#5", "F#5", "A5",
//                 "C6", "D#6", "F#6", "A6",
//                 "C7"];


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
      console.log("error loading file");
    }
  }
//   console.log(urls);
  return urls;
}

export const AudioInput = async (midiUrl , instrument) => {
    const fullUrl = `http://localhost:8000${midiUrl}`;
    const response = await fetch(fullUrl);
    const arrayBuffer = await response.arrayBuffer();
    const midi = new Midi(arrayBuffer);
    console.log(midi)
    const Instrument = instrument == "Select an option" ? "acoustic_grand_piano" : instrument;
    const Sampler = new Tone.Sampler({
        urls: getValidSamplerUrls(`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${Instrument}-mp3/`),
        baseUrl:`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${Instrument}/`,
        release:1
    }).toDestination();
    Tone.loaded().then(()=>{
        console.log("wow")
    })
};

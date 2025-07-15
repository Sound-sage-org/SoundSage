import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
export const AudioInput = async (midiUrl , instrument) => {
    const fullUrl = "http://localhost:8000${data.midi_url}";
    const response = await fetch(fullUrl);
    const arrayBuffer = await response.arrayBuffer();
    const midi = new Midi(arrayBuffer);
    console.log(midi)
    const Instrument = instrument || "acoustic_grand_piano";
    const Sampler = new Tone.Sampler({
        urls:{
            A0:"A0.mp3",
            C0:"C0.mp3",
            "D#0":"D#0.mp3",
            "F#0":"F#0.mp3",
            A1:"A1.mp3",
            C1:"C1.mp3",
            "D#1":"D#1.mp3",
            "F#1":"F#1.mp3",
            A2:"A2.mp3",
            C2:"C2.mp3",
            "D#2":"D#2.mp3",
            "F#2":"F#2.mp3",
            A3:"A3.mp3",
            C3:"C3.mp3",
            "D#3":"D#3.mp3",
            "F#3":"F#3.mp3",
            A4:"A4.mp3",
            C4:"C4.mp3",
            "D#4":"D#4.mp3",
            "F#4":"F#4.mp3",
            A5:"A5.mp3",
            C5:"C5.mp3",
            "D#5":"D#5.mp3",
            "F#5":"F#5.mp3",
            A6:"A6.mp3",
            C6:"C6.mp3",
            "D#6":"D#6.mp3",
            "F#6":"F#6.mp3",
            A7:"A7.mp3",
            C7:"C7.mp3",
            "D#7":"D#7.mp3",
            "F#7":"F#7.mp3",
        },
        baseUrl:`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${instrument}-mp3/`,
        release:1
    }).toDestination();
    Tone.loaded().then(()=>{
        
    })
};

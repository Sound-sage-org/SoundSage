import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
export const AudioInput = async (midiUrl , instrument) => {
    const fullUrl = `http://localhost:8000${data.midi_url}`;
    const response = await fetch(fullUrl);
    const arrayBuffer = await response.arrayBuffer();
    const midi = new Midi(arrayBuffer);
    console.log(midi)

    const Sampler = new Tone.Sampler({
        urls:{
        
        },
        baseUrl:"",
        release:1
    }).toDestination();
    Tone.loaded().then(()=>{

    })
};

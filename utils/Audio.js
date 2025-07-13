import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
export const AudioInput = async (midiUrl , instrument) => {
    const response = await fetch(midiUrl);
    const arrayBuffer = await response.arrayBuffer();
    const midi = new Midi(arrayBuffer);
    const Sampler = new Tone.Sampler({
        urls:{

        },
        baseUrl:"",
        release:1
    }).toDestination();
    Tone.loaded().then(()=>{

    })
};

import { useState } from "react";
import SoundBox from "./SoundBox";
import DropDown from "./DropDown";
import { loadAndPlayMidi } from "../utils/Audio.js";
import * as Tone from "tone";

const Output = ({ instrument, setInstrument, audioData }) => {
  const [LIGHTARR, setLIGHTARR] = useState([]);
  const [sampler, setSampler] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const handleClick = async () => {
    await Tone.start();
    await loadAndPlayMidi(audioData, instrument, setLIGHTARR, setSampler, setStartTime);
  };

  return (
    <div className="flex justify-between items-center h-100 p-2 mt-5 w-screen">
      <div className="w-[55%] h-full bg-gray-300 overflow-y-scroll overflow-x-scroll border-1 custom-scrollbar rounded-xl">
        <SoundBox LIGHTARR={LIGHTARR} sampler={sampler} />
      </div>
      <div className="flex justify-center h-96">
        <DropDown instrument={instrument} setInstrument={setInstrument} />
      </div>
      <button onClick={handleClick}>CLICK ME</button>
    </div>
  );
};

export default Output;

import { useState , useEffect } from "react";

const SoundBox = ()=>{
    const midiPitches = [];
    const pitchNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const [lightenup , setLightenUp] = useState([]);
    const LIGHTARR = [['C-1' , 'F-1' , 'F#-1'] , ['D-1' , 'D#-1' , 'G-1'] , ['F-1' , 'C-1' ,'D#-1']];
    for (let i = 0; i < 88; i++) {
        const octave = Math.floor(i / 12) - 1;
        const note = pitchNames[i % 12];
        midiPitches[i] = {
            name: `${note}${octave}`,
            number: i
        };
    }
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
        setLightenUp(LIGHTARR[index]);
        index = (index + 1) % LIGHTARR.length;
        }, 1000);

        return () => clearInterval(interval); 
    }, []);
    console.log(midiPitches);
    return (
        <div className="w-2/3 overflow-scroll h-full bg-gray-300">
            <ul className="w-full">
            {midiPitches.map((ele, idx) => (
                <li
                key={idx}
                className={`w-full h-10 border border-gray-500 flex items-center ${
                    lightenup.includes(ele.name) ? 'bg-blue-300' : ''
                }`}
                >
                {/* Note label section with vertical divider */}
                <div className="w-24 pr-2 text-right relative">
                    {ele.name} ({ele.number})
                    <div className="absolute top-1 bottom-1 right-0 w-[2px] h-10 bg-black"></div>
                </div>

                {/* You can add more content here on the right side if needed */}
                <div className="flex-1 pl-2 h-5"> </div>
                </li>
            ))}
            </ul>
        </div>
        );


}

export default SoundBox;
import { useState, useEffect } from "react";
import SoundBox from "./SoundBox";
import DropDown from "./DropDown";
import { parseMidiFile, createSampler } from "../utils/Audio.js";
import * as Tone from "tone";

const Output = ({ instrument, setInstrument, audioData }) => {
  const [LIGHTARR, setLIGHTARR] = useState([]);
  const [sampler, setSampler] = useState(null);
  const [isLoadingSampler, setIsLoadingSampler] = useState(false);
  const [isLoadingMidi, setIsLoadingMidi] = useState(false);

  // Load MIDI data when audioData changes
  useEffect(() => {
    const loadMidiData = async () => {
      if (!audioData) return;
      
      setIsLoadingMidi(true);
      try {
        const songArr = await parseMidiFile(audioData);
        setLIGHTARR(songArr);
        //console.log(`Loaded ${songArr.length} notes from MIDI file`);
      } catch (error) {
        console.error("Error loading MIDI data:", error);
        setLIGHTARR([]);
      } finally {
        setIsLoadingMidi(false);
      }
    };

    loadMidiData();
  }, [audioData]);

  // Create/update sampler when instrument changes
  useEffect(() => {
    const loadSampler = async () => {
      if (!instrument || instrument === "Select Instrument") return;
      
      setIsLoadingSampler(true);
      try {
        // Ensure Tone is started
        if (Tone.context.state !== 'running') {
          await Tone.start();
        }

        // Dispose of previous sampler
        if (sampler) {
          sampler.dispose();
        }

        const newSampler = await createSampler(instrument);
        setSampler(newSampler);
        //console.log(`Sampler loaded for instrument: ${instrument}`);
      } catch (error) {
        console.error("Error loading sampler:", error);
        setSampler(null);
      } finally {
        setIsLoadingSampler(false);
      }
    };

    loadSampler();
  }, [instrument]);

  // Initialize with default sampler on mount
  useEffect(() => {
    const initializeDefaultSampler = async () => {
      if (!sampler && !isLoadingSampler) {
        setIsLoadingSampler(true);
        try {
          if (Tone.context.state !== 'running') {
            await Tone.start();
          }
          
          const defaultSampler = await createSampler("acoustic_grand_piano");
          setSampler(defaultSampler);
          //console.log("Default sampler (acoustic_grand_piano) loaded");
        } catch (error) {
          console.error("Error loading default sampler:", error);
        } finally {
          setIsLoadingSampler(false);
        }
      }
    };

    initializeDefaultSampler();
  }, []);

  // Cleanup sampler on unmount
  useEffect(() => {
    return () => {
      if (sampler) {
        sampler.dispose();
      }
    };
  }, [sampler]);

  const handleManualPlay = async () => {
    if (!sampler) {
      console.warn("No sampler available");
      return;
    }

    try {
      // Ensure Tone is started
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      // Play a test note
      sampler.triggerAttackRelease("C4", "8n");
      //console.log("Manual play triggered");
    } catch (error) {
      console.error("Error in manual play:", error);
    }
  };

  const getInstrumentDisplayName = () => {
    if (instrument === "Select an option" || !instrument) {
      return "Acoustic Grand Piano (Default)";
    }
    return instrument.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex flex-col h-full mt-8 mx-4">

      {/* Main content area */}
      <div className="flex flex-1 gap-4 h-full overflow-hidden">
        {/* Piano Roll */}
        <div className="h-[394px] flex-1 rounded-lg shadow-md overflow-hidden mb-4">
          <SoundBox 
            LIGHTARR={LIGHTARR} 
            sampler={sampler}
            setLIGHTARR = {setLIGHTARR}
          />
        </div>

        {/* Instrument Selector */}
        <div className="w-80 flex-shrink-0">
          <div className="flex-col rounded-lg shadow-md h-full">
            {audioData && (
              <a 
                href={`http://localhost:8000${audioData}`} 
                download="converted.mid" 
                className="pt-1 text-center mb-2 inline-block bg-green-600 text-white rounded hover:bg-green-700 transition h-[35px] w-[320px]"
              >
                ⬇ Download MIDI
              </a>
            )}

            <DropDown 
              instrument={instrument} 
              setInstrument={setInstrument} 
              setSampler={setSampler}
            />
            
            {/* Loading indicator */}
            {isLoadingSampler && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600 mt-2">Loading instrument...</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Output;
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
        console.log(`Loaded ${songArr.length} notes from MIDI file`);
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
      if (!instrument || instrument === "Select an option") return;
      
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
        console.log(`Sampler loaded for instrument: ${instrument}`);
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
          console.log("Default sampler (acoustic_grand_piano) loaded");
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
      console.log("Manual play triggered");
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
    <div className="flex flex-col h-full p-4 bg-gray-100">

      {/* Main content area */}
      <div className="flex flex-1 gap-4 h-full overflow-hidden">
        {/* Piano Roll */}
        <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
          <SoundBox 
            LIGHTARR={LIGHTARR} 
            sampler={sampler}
          />
        </div>

        {/* Instrument Selector */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-4 h-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Select Instrument</h3>
            <DropDown 
              instrument={instrument} 
              setInstrument={setInstrument} 
            />
            
            {/* Loading indicator */}
            {isLoadingSampler && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600 mt-2">Loading instrument...</p>
              </div>
            )}
            
            {/* Sampler status */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    sampler && !isLoadingSampler 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sampler && !isLoadingSampler ? 'Ready' : 'Loading'}
                  </span>
                </div>
                {sampler && (
                  <div className="mt-2 text-xs text-gray-600">
                    Tone.js context: {Tone.context.state}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Output;
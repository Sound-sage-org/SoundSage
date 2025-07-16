import { useState } from 'react';
import { Dropdown } from 'rsuite';

const instrumentMap = {
  "Accordion": "accordian",
  "Acoustic Bass": "acoustic_bass",
  "Acoustic Grand Piano": "acoustic_grand_piano",
  "Acoustic Guitar (Steel)": "acoustic_guitar_steel",
  "Banjo": "banjo",
  "Bagpipe": "bagpipe",
  "Brass Section": "brass_section",
  "Cello": "cello",
  "Choir Aahs": "choir_aahs",
  "Clarinet": "clarinet",
  "Church Organ": "church_organ",
  "Electric Bass": "electric_bass_finger",
  "Electric Grand Piano": "electric_grand_piano",
  "Electric Guitar": "electric_guitar_clean",
  "Electric Piano": "electric_piano_1",
  "English Horn": "english_horn",
  "Flute": "flute",
  "Harmonica": "harmonica",
  "Glockenspiel": "glockenspiel",
  "Gunshot": "gunshot",
  "Koto": "koto",
  "Helicopter": "helicopter",
  "Kalimba": "kalimba",
  "Harpsichord": "harpischord",
  "Marimba": "marimba",
  "Ocarina": "ocarina",
  "Seashore": "seashore",
  "Sitar": "sitar",
  "Shanai": "shanai",
  "Slap Bass": "slap_bass_1",
  "Soprano Sax": "soprano_sax",
  "String Ensemble": "string_ensemble_1",
  "Trumpet": "trumpet",
  "Viola": "viola",
  "Violin": "violin",
  "Whistle": "whistle",
  "Xylophone": "xylophone",
  "Synth (Sawtooth)": "lead_2_sawtooth"
};

export default function InstrumentSelector({setInstrument , instrument, setSampler}) {
  return (
    <div className="w-[calc(100%)] border-2 h-[350px] mt-0 bg-gray-800 flex justify-center rounded-lg shadow-md overflow-y-scroll no-scrollbar">
      <div className="w-[calc(100%)] max-w-md">
        <Dropdown
          title={`🎵 ${instrument?instrument:"Select Instrument"}`}
          onSelect={(eventKey) => {
            setInstrument(eventKey)
            setSampler(null)
          }}
          placement="bottomStart"
          className="w-[calc(90%)] bg-gray-400 rounded-lg shadow-lg text-lg ml-4"
          menuClassName="w-[calc(100%)]"
        >
          {Object.entries(instrumentMap).map(([displayName, internalName], idx) => (
            <Dropdown.Item
              key={idx}
              eventKey={internalName}
              className={`w-full rounded-md transition-all duration-200 cursor-pointer ${
                instrument === internalName
                  ? 'bg-blue-200 font-semibold'
                  : 'hover:bg-blue-100'
              }`}
            >
              {displayName}
            </Dropdown.Item>
          ))}

        </Dropdown>
      </div>
    </div>
  );
}

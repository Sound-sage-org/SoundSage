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
imageMap = {
  "accordion": "https://example.com/accordion.png",
  "acoustic_bass": "https://example.com/acoustic_bass.png",
  "acoustic_grand_piano": "https://example.com/acoustic_grand_piano.png",
  "acoustic_guitar_steel": "https://example.com/acoustic_guitar_steel.png",
  "banjo": "https://example.com/banjo.png",
  "bagpipe": "https://example.com/bagpipe.png",
  "brass_section": "https://example.com/brass_section.png",
  "cello": "https://example.com/cello.png",
  "choir_aahs": "https://example.com/choir_aahs.png",
  "clarinet": "https://example.com/clarinet.png",
  "church_organ": "https://example.com/church_organ.png",
  "electric_bass_finger": "https://example.com/electric_bass_finger.png",
  "electric_grand_piano": "https://example.com/electric_grand_piano.png",
  "electric_guitar_clean": "https://example.com/electric_guitar_clean.png",
  "electric_piano_1": "https://example.com/electric_piano_1.png",
  "english_horn": "https://example.com/english_horn.png",
  "flute": "https://example.com/flute.png",
  "harmonica": "https://example.com/harmonica.png",
  "glockenspiel": "https://example.com/glockenspiel.png",
  "gunshot": "https://example.com/gunshot.png",
  "koto": "https://example.com/koto.png",
  "helicopter": "https://example.com/helicopter.png",
  "kalimba": "https://example.com/kalimba.png",
  "harpischord": "https://example.com/harpischord.png",
  "marimba": "https://example.com/marimba.png",
  "ocarina": "https://example.com/ocarina.png",
  "seashore": "https://example.com/seashore.png",
  "sitar": "https://example.com/sitar.png",
  "shanai": "https://example.com/shanai.png",
  "slap_bass_1": "https://example.com/slap_bass_1.png",
  "soprano_sax": "https://example.com/soprano_sax.png",
  "string_ensemble_1": "https://example.com/string_ensemble_1.png",
  "trumpet": "https://example.com/trumpet.png",
  "viola": "https://example.com/viola.png",
  "violin": "https://example.com/violin.png",
  "whistle": "https://example.com/whistle.png",
  "xylophone": "https://example.com/xylophone.png",
  "lead_2_sawtooth": "https://example.com/lead_2_sawtooth.png"
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
        <img src={``}/>
      </div>
    </div>
  );
}

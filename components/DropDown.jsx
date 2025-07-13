import { useState } from 'react';
import { Dropdown } from 'rsuite';

const instruments =  [
    "Guitar", "Violin", "Bass", "Brass", "Flute",
    "Keyboard", "Organ", "String", "Vocal" , "tabla" , "Sitar"
  ];

export default function InstrumentSelector({setInstrument , instrument}) {

  return (
    <div className="w-[600px] border-2 h-full mt-0 bg-blue-400 flex justify-center rounded-lg custom-scrollbar shadow-md overflow-y-scroll">
      <div className="w-full max-w-md">
        <Dropdown
          title={`🎵 ${instrument?instrument:"Select an Option"}`}
          onSelect={(eventKey) => setInstrument(eventKey)}
          placement="bottomStart"
          className="w-full bg-white rounded-lg shadow-lg text-lg"
          menuClassName="w-full"
        >
          {instruments.map((item, idx) => (
            <Dropdown.Item
              key={idx}
              eventKey={item}
              className={`w-full px-4 py-2 rounded-md transition-all duration-200 cursor-pointer ${
                instrument === item
                  ? 'bg-blue-200 font-semibold'
                  : 'hover:bg-blue-100'
              }`}
            >
              {item}
            </Dropdown.Item>
          ))}
        </Dropdown>
      </div>
    </div>
  );
}

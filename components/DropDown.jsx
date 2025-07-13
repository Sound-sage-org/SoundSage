import { Dropdown } from 'rsuite';

const DropDown = ({ instrument, setInstrument }) => {
  const items = [
    "Guitar", "Violin", "Bass", "Brass", "Flute",
    "Keyboard", "Organ", "String", "Vocal" , "tabla" , "Sitar"
  ];

  return (
    <div className="w-[600px] border-2 h-full mt-0 bg-blue-400 flex justify-center rounded-lg custom-scrollbar shadow-md  overflow-y-scroll">
      <div className="w-full max-w-md">
        <Dropdown
          title="🎵 Select Instrument"
          onSelect={setInstrument}
          placement="bottomStart"
          className="w-full bg-white rounded-lg shadow-lg text-lg"
          menuClassName="w-full"
        >
          {items.map((item, idx) => (
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
};

export default DropDown;

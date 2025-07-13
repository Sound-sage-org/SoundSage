import { Dropdown } from 'rsuite';


const DropDown = ({instrument , setInstrument}) => {
  return (
    <div className='w-[600px] border-2 h-full pt-0 mt-0 bg-blue-400 flex justify-center rounded-md custom-scrollbar overflow-y-scroll '>
      <div className='w-full px-4 flex justify-center '> 
        <Dropdown 
          title="Options" 
          onSelect={(eventKey) => setInstrument(eventKey)} 
          className="w-full block text-center text-2xl cursor-pointer" 
          menuClassName="w-full"
        >
          <Dropdown.Item eventKey="Guitar" className={`w-full  m-1 ${instrument==='Guitar' ? 'bg-gray-200':''}`}>Guitar</Dropdown.Item>
          <Dropdown.Item eventKey="Violin" className={`w-full m-1 ${instrument==='Violin' ? 'bg-gray-200':''}`}>Violin</Dropdown.Item>
          <Dropdown.Item eventKey="Bass" className={`w-full m-1  ${instrument==='Bass' ? 'bg-gray-200':''}`}>Bass</Dropdown.Item>
          <Dropdown.Item eventKey="Brass" className={`w-full m-1 ${instrument==='Brass' ? 'bg-gray-200':''}`}>Brass</Dropdown.Item>
          <Dropdown.Item eventKey="Flute" className={`w-full m-1 ${instrument==='Flute' ? 'bg-gray-200':''}`}>Flute</Dropdown.Item>
          <Dropdown.Item eventKey="Keyboard" className={`w-full m-1 ${instrument==='Keyboard' ? 'bg-gray-200':''}`}>Keyboard</Dropdown.Item>
          <Dropdown.Item eventKey="Organ" className={`w-full m-1 ${instrument==='Organ' ? 'bg-gray-200':''}`}>Organ</Dropdown.Item>
          <Dropdown.Item eventKey="String" className={`w-full m-1 ${instrument==='String' ? 'bg-gray-200':''}`}>String</Dropdown.Item>
          <Dropdown.Item eventKey="Vocal" className={`w-full m-1 ${instrument==='Vocal' ? 'bg-gray-200':''}`}>Vocal</Dropdown.Item>
          <Dropdown.Item eventKey="Vocal" className={`w-full m-1 ${instrument==='Vocal' ? 'bg-gray-200':''}`}>Vocal</Dropdown.Item>
          <Dropdown.Item eventKey="Vocal" className={`w-full m-1 ${instrument==='Vocal' ? 'bg-gray-200':''}`}>Vocal</Dropdown.Item>
          <Dropdown.Item eventKey="Vocal" className={`w-full m-1 ${instrument==='Vocal' ? 'bg-gray-200':''}`}>Vocal</Dropdown.Item>

        </Dropdown>
      </div>
    </div>

  );
};
export default DropDown;
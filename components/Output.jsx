import { useState } from "react"
import SoundBox from "./SoundBox"
import DropDown from "./DropDown"




const Output  = ()=>{
    const [instrument , setInstrument] = useState(null)
    return(
        <div className="flex justify-between items-center h-100   p-2 mt-5 w-screen">
                <div className="w-[55%] h-full bg-gray-300  overflow-y-scroll overflow-x-scroll  border-1 custom-scrollbar  rounded-xl">
                    <SoundBox/>
                </div>
                <div className="flex justify-center h-96">
                    <DropDown instrument = {instrument} setInstrument = {setInstrument}/>
                </div>
        </div>
    )
}

export default Output


import SoundBox from "./SoundBox"

const Output  = ()=>{
    return(
        <div className="flex justify-between items-center h-100  border-2">
                <SoundBox/>
                <input type="text" placeholder="type" className="bg-gray-300"/>
        </div>
    )
}

export default Output


import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from '../components/Header.jsx'
import DragDrop from '../components/DragDrop.jsx'
import Loading from '../components/Loading.jsx'
import Output from '../components/Output.jsx'

import { AudioInput } from '../utils/Audio.js'
function App() {
  const [isFileGiven , setIsFileGiven] = useState(false)
  const [isProcessing , setIsProcessing ] = useState(false)
  const [audioFiles, setAudioFiles] = useState(null);
  const [audioData , setAudioData] = useState(null);
  if(!isProcessing && !isFileGiven){
    return (
      <>
          <div className='w-full p-0 mt-0'>
          <Header/> 
          
          <div className='flex justify-center pt-20'>
            <DragDrop setIsFileGiven={setIsFileGiven} setIsProcessing={setIsProcessing} audioData ={audioData} setAudioData = {setAudioData} setAudioFiles={setAudioFiles} audioFiles={audioFiles}/>
          </div>
        </div>
      </>
      
    )
  }
  else if(isFileGiven && isProcessing){
    return(
      <div>
        <Header/>
        <Loading setIsProcessing = {setIsProcessing}/>
      </div>
    )
  }
  else{
    return(
      <div>
        <Header></Header>
        <Output audioData = {audioData} instrument={instrument} setInstrument={setInstrument}/>
      </div>
    )
  }
}

export default App

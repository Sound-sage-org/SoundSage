import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from '../components/Header.jsx'
import DragDrop from '../components/DragDrop.jsx'
import Loading from '../components/Loading.jsx'
import Output from '../components/Output.jsx'
function App() {
  const [isFileGiven , setIsFileGiven] = useState(false)
  const [isProcessing , setIsProcessing ] = useState(false)
  if(!isProcessing && !isFileGiven){
    return (
      <div className='w-full p-0 mt-0'>
        <Header/>
        
        <div className='flex justify-center pt-20'>
          <DragDrop setIsFileGiven={setIsFileGiven} setIsProcessing={setIsProcessing}/>
        </div>
      </div>
    )
  }
  else if(isFileGiven && isProcessing){
    return(
      <div>
        <Header/>
        <Loading/>
      </div>
    )
  }
  else{
    return(
      <div>
        <Header></Header>
        <Output/>
      </div>
    )
  }
}

export default App

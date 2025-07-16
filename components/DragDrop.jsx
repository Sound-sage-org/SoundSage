import { useState  , useEffect} from "react";
import Upload from "../utils/upload.js";
const DragDrop = ({setIsFileGiven , setIsProcessing , audioFiles , setAudioFiles , audioData , setAudioData}) => {

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const audioOnly = files.filter(file => file.type.startsWith("audio/"));
    //console.log(files)
    if (audioOnly.length === 0) {
      return;
    }

    setAudioFiles(audioOnly);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
  const fetch = async () => {
    if (audioFiles && audioFiles.length > 0) {
      setIsFileGiven(true);
      setIsProcessing(true);

      const handleUpload = async () => {
        const midiUrl = await Upload(audioFiles[0], setIsProcessing);
        setAudioData(midiUrl);
      };

      await handleUpload();
    }
  };

  fetch();
  }, [audioFiles]);


  return (
    <div
      className="w-full max-w-xl h-50 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-600 hover:border-blue-500 transition-all cursor-pointer"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      
        <p>Drag and drop audio files here</p>
        <ul className="text-left px-4">
          {audioFiles?.map((file, index) => (
            <li key={index}>
              🎵 {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </li>
          ))}
        </ul>
      
    </div>
  );
};

export default DragDrop;
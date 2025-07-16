const Upload = async (file, setIsProcessing) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    //console.log("MIDI file URL:", data.midi_url);

    return data.midi_url;
  } catch (err) {
    console.error("Upload failed:", err);
    return null;
  } finally {
    setIsProcessing(false);
  }
};
export default Upload;

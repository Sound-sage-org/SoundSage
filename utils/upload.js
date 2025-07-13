const Upload = async (file)=>{
    const response = await fetch('http://localhost:8000/upload' , {
        method:"POST" , 
        body:"formData"
    })
    console.log(response)
}
export default Upload
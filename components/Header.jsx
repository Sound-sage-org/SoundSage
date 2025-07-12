const Header = ()=>{
    return(
        <div className=" rounded-md mt-0 ">

            <div className="flex cursor-pointer m-2 relative">
                <img src="SoundSage.png" className="w-25 h-25 m-0"/> 
                <p className="oi-font text-3xl pt-8">SoundSage</p>
            </div>
            <br/>
            <div className="w-screen flex justify-center">
            <div className="max-w-3xl text-center">
                    <p class=" outfit-font text-xl  text-gray-700">
                    Sound Sage is an AI-powered tool that takes your audio, identifies the musical notes being played, and replays them using a different instrument. Whether it's converting a guitar riff to piano or a violin solo to saxophone, Sound Sage transforms your sound while keeping the music intact — all in real time.
                    </p>


            </div>
            </div>

        </div>
    )
}   

export default Header;
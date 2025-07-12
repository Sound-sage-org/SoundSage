const Loading = ({setIsProcessing})=>{
    return(
        <div className="flex flex-col items-center justify-center h-90 p-0 space-y-2">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-black"></div>
        <p className="text-center pl-2">  Loading...</p>
        </div>

    )
}

export default Loading
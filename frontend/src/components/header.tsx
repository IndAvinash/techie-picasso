import { useEffect, useState } from "react";
import RoomManager from "./room-menu";

export default function Header(){
    const id = "";
    const [mode,setMode] = useState<"normal" | "room">("normal");
    const toggleMode = ()=>{
        if(mode==="normal")
        setMode("room");
    else setMode("normal")
    }
    useEffect(()=>{

    },[mode])
    if(mode==="room"){
        return <>
        <button className="btn-primary back-btn" onClick={()=>{toggleMode()}}>Back</button>
        <RoomManager/></>;
    }
    return (
        
        <>
        
        </>
    )
}
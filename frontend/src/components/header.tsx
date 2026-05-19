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
        <header className="app-header">
        <div className="header-left">
            <div className="logo">
                <span>Techie Picasso</span>
            </div>
        </div>
        <nav className="header-center">
            <div className="toolbar">
                <button className="tool-btn" data-tooltip="span" >A</button>
                <button className="tool-btn" data-tooltip="draw">B</button>
                <button className="tool-btn" data-tooltip="erase">C</button>
            </div>
        </nav>
        <div className="header-right">
            <button className="btn-primary" onClick={()=>toggleMode()}>
                Create Room
            </button>
            <button className="icon-btn">D</button>
        </div>
        </header>
        </>
    )
}
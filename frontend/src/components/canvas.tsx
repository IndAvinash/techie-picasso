import {useRef, useEffect,useState} from 'react'
import { Stage, Layer, Line } from 'react-konva';
import { Download, Hand, Pen, Eraser, UserX, Users, Plus } from "lucide-react";
// import type { StageConfig } from 'konva/lib/Stage';
import { useCanvasInteractions } from '../hooks/useCanvasInteractions';

type LineType = { points: number[]; color: string; strokeWidth: number; tool: 'pen' | 'eraser' | 'pin' | 'hand' }

export default function Canvas(){
    const [tool, setTool] = useState<'pen' | 'eraser' | 'pin' | 'hand'>('pen');
    const [lines, setLines] = useState<LineType[]>([]);
    const [color, setColor] = useState('#000000');

    const stageRef = useRef<any>(null)
   

  

  const {
    stageScale, stagePos,
    handleWheel, handleMouseDown, handleMouseMove, handleMouseUp
  } = useCanvasInteractions(tool, color,setLines,lines);

const downloadCanvas = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL();
      const link = document.createElement('a');
      link.download = 'canvas.png';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
useEffect(
    ()=>{
        },[]
)


return(
    <>
    <header className="app-header">
        <div className="header-left">
            <div className="logo">
                <span>Techie Picasso</span>
            </div>
        </div>
        <nav className="header-center">
            <div className="toolbar">
                <button className={`tool-btn ${tool === 'hand' ? 'active' : ''}`} data-tooltip="span" onClick={()=>{setTool('hand')}} ><Hand/></button>
                <button className={`tool-btn ${tool === 'pen' ? 'active' : ''}`} data-tooltip="draw" onClick={()=>{setTool('pen')}}><Pen/></button>
                <button className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`} data-tooltip="erase" onClick={()=>{setTool('eraser')}}><Eraser/></button>
            </div>
        </nav>
        <div className="header-right">
            <button className="btn-primary" onClick={()=>{}}>
                Create Room
            </button>
            <button className="icon-btn" onClick={()=>downloadCanvas()}><Download/></button>
        </div>
        </header>
    <Stage
        ref={stageRef}
        className='drawing-canvas'
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        scaleX={stageScale}
        scaleY={stageScale}
        draggable={tool === 'hand'}
        x={stagePos.x}
        y={stagePos.y}>
         <Layer>
    {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              tension={0.5}
              lineCap="round"
               globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}        
              lineJoin="round"
            />
          ))}
              </Layer>
    </Stage>
    </>
)
}
import {useRef, useEffect,useState} from 'react'
import { Stage, Layer, Line } from 'react-konva';
import { Download, Hand, Pen, Eraser, UserX, Users, Plus } from "lucide-react";
// import type { StageConfig } from 'konva/lib/Stage';


type LineType = { points: number[]; color: string; strokeWidth: number; tool: 'pen' | 'eraser' | 'pin' | 'hand' }
export default function Canvas(){
    const [tool, setTool] = useState<'pen' | 'eraser' | 'pin' | 'hand'>('pen');
    const [lines, setLines] = useState<LineType[]>([]);
    const [color, setColor] = useState('#000000');

    const stageRef = useRef<any>(null)
    const [stageScale, setStageScale] = useState(1);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const isDrawing = useRef(false);
const handleWheel = (e:any)=>{
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (e.evt.ctrlKey) {
      const scaleBy = 1.05;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };
      const newScale = e.evt.deltaY < 0 ? ((oldScale * scaleBy) > 16 ? 16 : oldScale * scaleBy) : ((oldScale / scaleBy) < 0.1 ? 0.1 : (oldScale / scaleBy));
      setStageScale(newScale);
      setStagePos({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    } else {
      setStagePos((prev) => ({
        x: prev.x - e.evt.deltaX,
        y: prev.y - e.evt.deltaY,
      }));
    }
}
 const getRelativePointerPosition = (stage: any) => {
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    return transform.point(pos);
  };
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
const handleMouseDown = (e:any)=>{
    isDrawing.current  = tool==='eraser' ? true : tool === 'pen' ? true : false;    
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    setLines([...lines, { points: [pos.x, pos.y], color, strokeWidth: tool === 'pen' ? 5 : 20 ,tool}]);
    
}
const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    
    const nextLines = [...lines];
    const lastLine = { ...nextLines[nextLines.length - 1] };
    
    lastLine.points = lastLine.points.concat([pos.x, pos.y]);
    nextLines[nextLines.length - 1] = lastLine;
    
    setLines(nextLines);
  };

const handleMouseUp = () => {
    isDrawing.current = false;
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
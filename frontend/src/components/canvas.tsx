import {useRef, useEffect,useState} from 'react'
import Header from './header';
import { Stage, Layer, Rect, Circle, Text, Line } from 'react-konva';


type LineType = { points: number[]; color: string; strokeWidth: number }
export default function Canvas(){
 const [tool, setTool] = useState<'pen' | 'eraser' | 'pin' | 'hand'>('pen');
 const [lines, setLines] = useState<LineType[]>([]);
  const [color, setColor] = useState('#820000');
  const isDrawing = useRef(false);

const handleMouseDown = (e:any)=>{
    isDrawing.current  = true
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    // Start a brand new stroke
    setLines([...lines, { points: [pos.x, pos.y], color, strokeWidth: 5 }]);
    
}
const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    // Mutate the last line safely using local copies
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
                <button className="tool-btn" data-tooltip="span" >A</button>
                <button className="tool-btn" data-tooltip="draw">B</button>
                <button className="tool-btn" data-tooltip="erase">C</button>
            </div>
        </nav>
        <div className="header-right">
            <button className="btn-primary" onClick={()=>{}}>
                Create Room
            </button>
            <button className="icon-btn">D</button>
        </div>
        </header>
    <Stage
    className='drawing-canvas'
    width={window.innerWidth}
    height={window.innerHeight}
    onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        // onMouseLeave={handleMouseUp}
        >
         <Layer>
    {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}
              </Layer>
    </Stage>
    </>
)
}
import {useRef, useEffect,useState} from 'react'
import { useParams } from 'react-router-dom';
import { Stage, Layer, Line } from 'react-konva';
import { Download, Hand, Pen, Eraser,Users, Pin } from "lucide-react";
import { useCanvasInteractions } from '../hooks/useCanvasInteractions';
import { getCurrentUser, useYJsRoom } from '../hooks/useYJsRoom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { RoomMenu } from './RoomMenu';

type LineType = { points: number[]; color: string; strokeWidth: number; tool: 'pen' | 'eraser' | 'pin' | 'hand' }

const API_URL = 'http://localhost:3000';
export default function Canvas(){
        const navigate = useNavigate();
      const { roomId } = useParams();
    const [tool, setTool] = useState<'pen' | 'eraser' | 'pin' | 'hand'>('pen');
    const [color, setColor] = useState('#000000');
    const [showMenu, setShowMenu] = useState(false);

    const stageRef = useRef<any>(null)
   

  const { lines, participants, roomOwnerId, docRef, YLinesRef , closeRoom} = useYJsRoom(roomId);

  const {
    stageScale, stagePos,
    handleWheel, handleMouseDown, handleMouseMove, handleMouseUp
  } = useCanvasInteractions(tool, color, docRef, YLinesRef);
const currentUser = getCurrentUser();

  const createRoom = async () => {
    try {
      let token = localStorage.getItem('token');
      
      if (!token) {
        const anonRes = await axios.post(`${API_URL}/auth/anonymous`);
        token = anonRes.data.token;
        localStorage.setItem('token', token??'');
        localStorage.setItem('user', JSON.stringify(anonRes.data.user));
        window.dispatchEvent(new Event('storage'));
      }

      const res = await axios.post(`${API_URL}/rooms/create`, { name: 'New Room' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowMenu(false);
      navigate(`/room/${res.data.id}`);
    } catch (err: any) {
      console.error(err);
      alert('Failed to create room. Please ensure the server is running.');
    }
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
                <button className={`tool-btn ${tool === 'pin' ? 'active' : ''}`} data-tooltip="pin" onClick={()=>{setTool('pin')}}><Pin/></button>
            </div>
        </nav>
        <div className="header-right">
            
            {roomId ? (
            <button className="btn-primary" onClick={() => setShowMenu(!showMenu)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} /> Room Menu ({participants.length}/4)
            </button>
          ) :(<button className="btn-primary" onClick={()=>{createRoom()
          }}>
                Create Room
            </button>)}
            {showMenu && (
            <RoomMenu 
              participants={participants} 
              roomOwnerId={roomOwnerId} 
              currentUser={currentUser}
              createRoom={createRoom} 
              closeRoom={closeRoom}
              navigate={navigate}
              setShowMenu={()=>setShowMenu(false)}
            />
          )}
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
import {useRef, useEffect,useState} from 'react'
import { useParams } from 'react-router-dom';
import { Stage, Layer, Line } from 'react-konva';
import { Download, Hand, Pen, Eraser,Users, Pin } from "lucide-react";
import { useCanvasInteractions } from '../hooks/useCanvasInteractions';
import { getCurrentUser, useYJsRoom } from '../hooks/useYJsRoom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { RoomMenu } from './RoomMenu';
import { URLImage,PinCreatorModal } from './Pins';
import { RoomClosedModal } from './RoomClosed';
type LineType = { points: number[]; color: string; strokeWidth: number; tool: 'pen' | 'eraser' | 'pin' | 'hand' }

const API_URL = 'http://localhost:3000';
export default function Canvas(){
        const navigate = useNavigate();
      const { roomId } = useParams();
    const [tool, setTool] = useState<'pen' | 'eraser' | 'pin' | 'hand'>('pen');
    const [color, setColor] = useState('#000000');
    const [showMenu, setShowMenu] = useState(false);
     const [showPinCreator, setShowPinCreator] = useState(false);
  const [customPins, setCustomPins] = useState<string[]>([]);
  const [selectedPinSrc, setSelectedPinSrc] = useState<string | undefined>(undefined);
  const [selectedPlacedPin, setSelectedPlacedPin] = useState<string | null>(null);

    const stageRef = useRef<any>(null)
   

  const { lines, pins, participants, roomOwnerId, ownerLeft, setOwnerLeft,docRef, yLinesRef, yPinsRef, kickUser, closeRoom} = useYJsRoom(roomId);

  const {
    stageScale, stagePos,
    handleWheel, handleMouseDown, handleMouseMove, handleMouseUp
  } = useCanvasInteractions(tool, color, docRef, yLinesRef, yPinsRef, selectedPinSrc);

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
                <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="color-picker" title="Choose Color"/>
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
              kickUser={kickUser}
              setShowMenu={()=>setShowMenu(false)}
            />
          )}
            <button className="icon-btn" onClick={()=>downloadCanvas()}><Download/></button>
        </div>
        </header>
          {ownerLeft && (
        <RoomClosedModal 
          downloadCanvas={downloadCanvas} 
          onExit={() => { setOwnerLeft(false); navigate('/'); }} 
        />
      )}
         {showPinCreator && (
        <PinCreatorModal 
          onClose={() => setShowPinCreator(false)} 
          onSave={(dataUrl) => {
            setCustomPins([...customPins, dataUrl]);
            setSelectedPinSrc(dataUrl);
            setShowPinCreator(false);
          }}
        />
      )}
          {tool === 'pin' && (
        <div style={{ position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10, background: '#1e1e24', padding: '8px', borderRadius: '8px', border: '1px solid #333' }}>
          {customPins.length === 0 && <span style={{ color: '#aaa', fontSize: '14px', alignSelf: 'center' }}>No pins created</span>}
          {customPins.map((src, i) => (
            <img key={i} src={src} alt="pin" style={{ width: '32px', height: '32px', border: selectedPinSrc === src ? '2px solid #3b82f6' : '1px solid transparent', cursor: 'pointer', borderRadius: '4px', background: 'white' }} onClick={() => setSelectedPinSrc(src)} />
          ))}
          <button onClick={() => setShowPinCreator(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 8px', fontSize: '12px' }}>+ Create New</button>
        </div>
      )}
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
          {pins.map((pin) => (
            <URLImage 
              key={pin.id} 
              pin={pin} 
              isSelected={selectedPlacedPin === pin.id}
              onClick={() => setSelectedPlacedPin(pin.id)}
              onDelete={() => yPinsRef.current?.delete(pin.id)}
              onDragEnd={(e) => {
                if (yPinsRef.current) {
                  yPinsRef.current.set(pin.id, { ...pin, x: e.target.x(), y: e.target.y() });
                }
              }} 
            />
          ))}
              </Layer>
    </Stage>
    </>
)
}
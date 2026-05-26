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

import { Header } from './Header';
import { PinToolbar } from './PinToolbar';

const API_URL = 'http://localhost:3000';

export default function Canvas(){
  const navigate = useNavigate();
  const { roomId } = useParams();
  
  // Local UI State
  const [tool, setTool] = useState<'pen' | 'eraser' | 'pin' | 'hand'>('pen');
  const [color, setColor] = useState('#000000');
  const [showPinCreator, setShowPinCreator] = useState(false);
  const [customPins, setCustomPins] = useState<string[]>([]);
  const [selectedPinSrc, setSelectedPinSrc] = useState<string | undefined>(undefined);
  const [selectedPlacedPin, setSelectedPlacedPin] = useState<string | null>(null);

  const stageRef = useRef<any>(null)

  // Custom hook that connects to our Yjs WebSocket server
  // It handles all the real-time syncing of lines, pins, and participants
  const { lines, pins, participants, roomOwnerId, ownerLeft, setOwnerLeft,docRef, yLinesRef, yPinsRef, kickUser, closeRoom} = useYJsRoom(roomId);

  // Custom hook that manages Konva canvas interactions (panning, zooming, drawing)
  const {
    stageScale, stagePos,
    handleWheel, handleMouseDown, handleMouseMove, handleMouseUp
  } = useCanvasInteractions(tool, color, docRef, yLinesRef, yPinsRef, selectedPinSrc);

  const currentUser = getCurrentUser();

  /**
   * Called when the user clicks "Create Room"
   * Hits the backend REST API to create a room in PostgreSQL, then navigates to the new room URL.
   */
  const createRoom = async () => {
    try {
      let token = localStorage.getItem('token');
      
      // If the user doesn't have an anonymous account yet, create one
      if (!token) {
        const anonRes = await axios.post(`${API_URL}/auth/anonymous`);
        token = anonRes.data.token;
        localStorage.setItem('token', token??'');
        localStorage.setItem('user', JSON.stringify(anonRes.data.user));
        window.dispatchEvent(new Event('storage')); // Notify other hooks that the user changed
      }

      // Create the room
      const res = await axios.post(`${API_URL}/rooms/create`, { name: 'New Room' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/room/${res.data.id}`);
    } catch (err: any) {
      console.error(err);
      alert('Failed to create room. Please ensure the server is running.');
    }
  };

  /**
   * Called when the user clicks the Download button.
   */
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
      <Header 
        roomId={roomId}
        participants={participants}
        roomOwnerId={roomOwnerId}
        currentUser={currentUser}
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        createRoom={createRoom}
        kickUser={kickUser}
        closeRoom={closeRoom}
        downloadCanvas={downloadCanvas}
        navigate={navigate}
      />
      
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
      
      <PinToolbar 
        tool={tool}
        customPins={customPins}
        selectedPinSrc={selectedPinSrc}
        setSelectedPinSrc={setSelectedPinSrc}
        setShowPinCreator={setShowPinCreator}
      />
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
import { useState } from 'react';
import { Download, Users } from "lucide-react";
import { RoomMenu } from './RoomMenu';
import { Toolbar } from './Toolbar';

interface HeaderProps {
  roomId?: string;
  participants: any[];
  roomOwnerId: string | null;
  currentUser: any;
  tool: string;
  setTool: (t: 'pen' | 'eraser' | 'pin' | 'hand') => void;
  color: string;
  setColor: (c: string) => void;
  createRoom: () => void;
  kickUser: (userId: string) => void;
  closeRoom: () => void;
  downloadCanvas: () => void;
  navigate: (path: string) => void;
}

/**
 * Renders the top navigation bar, including the logo, the drawing toolbar, 
 * and the room management controls on the right.
 */
export function Header({
  roomId, participants, roomOwnerId, currentUser, tool, setTool, color, setColor,
  createRoom, kickUser, closeRoom, downloadCanvas, navigate
}: HeaderProps) {
  // Toggles the visibility of the "Room Menu" dropdown
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo">
          <span>Techie Picasso</span>
        </div>
      </div>
      
      {/* Central tool and color selection bar */}
      <Toolbar tool={tool} setTool={setTool} color={color} setColor={setColor} />
      
      <div className="header-right">
        {roomId ? (
          // If we are currently in a room, show the Room Menu button and participant count
          <button className="btn-primary" onClick={() => setShowMenu(!showMenu)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} /> Room Menu ({participants.length}/4)
          </button>
        ) : (
          // If we are on the homepage, show the Create Room button
          <button className="btn-primary" onClick={() => createRoom()}>
            Create Room
          </button>
        )}

        {/* Dropdown menu displaying room participants and host controls */}
        {showMenu && (
          <RoomMenu 
            participants={participants} 
            roomOwnerId={roomOwnerId} 
            currentUser={currentUser}
            createRoom={createRoom} 
            closeRoom={closeRoom}
            navigate={navigate}
            kickUser={kickUser}
            setShowMenu={() => setShowMenu(false)}
          />
        )}

        {/* Export canvas to PNG button */}
        <button className="icon-btn" onClick={() => downloadCanvas()} title="Download Canvas">
          <Download />
        </button>
      </div>
    </header>
  );
}

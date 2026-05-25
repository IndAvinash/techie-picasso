import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_URL = 'http://localhost:3000';  
export type LineType = { points: number[]; color: string; strokeWidth: number; tool: 'pen' | 'eraser' | 'pin' | 'hand' }
export function useYJsRoom(roomId: string| undefined) {
  const navigate = useNavigate();
  const [doc, setdoc] = useState<Y.Doc | null>(null);
   const [lines, setLines] = useState<LineType[]>([]);
    let isMounted = true;
     const fetchRoom = async () => {
      if (!roomId) return;
      try {
        const res = await axios.get(`${API_URL}/rooms/${roomId}`);
        if (isMounted) setRoomOwnerId(res.data.ownerId);
      } catch (err) {
        console.error("Failed to fetch room details", err);
      }
    };
    fetchRoom();
  const [roomOwnerId, setRoomOwnerId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const docRef = useRef<Y.Doc | null>(null);
    const YLinesRef = useRef<Y.Array<LineType> | null>(null);
  useEffect(() => {
    setLines([]);
    const doc = new Y.Doc();
    const provider = new WebsocketProvider('ws://localhost:3000', roomId?roomId:'', doc);
    providerRef.current = provider;
    setdoc(doc);
    setProvider(provider);
    const yLines = doc.getArray<LineType>('lines');
    YLinesRef.current = yLines;
    docRef.current = doc;
    yLines.observe(() => {
      if (isMounted) setLines(yLines.toArray());
    });
      const syncParticipants = () => {
        if (!provider) return;
        const states = Array.from(provider.awareness.getStates().entries());
        const clients = states
          .filter(([_, state]: any) => state.user)
          .map(([clientID, state]: any) => ({ clientID, user: state.user }));
        
        if (isMounted) setParticipants(clients);

        const myId = provider.awareness.clientID;
        const myState = provider.awareness.getLocalState();
        
        if (myState && myState.user) {
          const myJoinedAt = myState.user.joinedAt || 0;
          const hasNewerConnection = states.some(([cId, s]: any) => {
            return cId !== myId && 
                   s.user && 
                   s.user.id === myState.user.id && 
                   (s.user.joinedAt || 0) > myJoinedAt;
          });

          if (hasNewerConnection) {
            alert('You have joined this room from another window. This connection will be closed.');
            provider.destroy();
            navigate('/');
            return;
          }
        }

        const sortedClients = states.map(s => s[0]).sort();
        const myIndex = sortedClients.indexOf(myId);
        if (myIndex >= 4) {
          alert('Room is full (Max 4 users).');
          navigate('/');
        }
      };

      provider.awareness.on('change', syncParticipants);
      
    return () => {
        // isMounted = false;
      provider.disconnect();
      doc.destroy();
    };
  }, [roomId,navigate]);

  return { lines, participants, roomOwnerId, docRef, YLinesRef };
}
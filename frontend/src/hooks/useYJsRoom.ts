import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_URL = 'http://localhost:3000';  
export type LineType = { points: number[]; color: string; strokeWidth: number; tool: 'pen' | 'eraser' | 'pin' | 'hand' }

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
export function useYJsRoom(roomId: string| undefined) {
  const navigate = useNavigate();

    const [lines, setLines] = useState<LineType[]>([]);
    const [roomOwnerId, setRoomOwnerId] = useState<string | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const docRef = useRef<Y.Doc | null>(null);
    const yLinesRef = useRef<Y.Array<LineType> | null>(null);
     const [ownerLeft, setOwnerLeft] = useState(false);
  const [pins, setPins] = useState<any[]>([]);
  const yPinsRef = useRef<Y.Map<any> | null>(null);
    
    useEffect(() => {

    setLines([]);
    let isMounted = true;
    const fetchRoom = async () => {
      if (!roomId) return;
      try {
        const res = await axios.get(`${API_URL}/rooms/${roomId}`);
        if (isMounted) setRoomOwnerId(res.data.ownerId);
      } catch (err) {
        console.error("Failed to fetch room details", err);
        navigate('/');
      }
    };
    fetchRoom();

    const doc = new Y.Doc();
    const yLines = doc.getArray<LineType>('lines');
    const yPins = doc.getMap<any>('pins');
    
    yLines.observe(() => {
      if (isMounted) setLines(yLines.toArray());
    });
    yPins.observe(() => {
      if (isMounted) setPins(Array.from(yPins.values()));
    });
    if(roomId){
        const provider = new WebsocketProvider('ws://localhost:3000', roomId?roomId:'', doc);
        providerRef.current = provider;
        setProvider(provider);
         provider.on('status', (event: any) => {
        if (event.status === 'disconnected') {
          console.warn('WebSocket disconnected. Ensure Nginx and the Node servers are running.');
        } else {
          console.log('WebSocket connected successfully.');
        }
      });
      
       const kickedMap = doc.getMap('kicked');
      kickedMap.observe(() => {
        const user = getCurrentUser();
        if (user && kickedMap.get(user.id)) {
          alert('You have been kicked by the room owner.');
          navigate('/');
        }
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
    const user = getCurrentUser();
      if (user) {
        user.joinedAt = Date.now();
        provider.awareness.setLocalStateField('user', user);
      } else {
        axios.post(`${API_URL}/auth/anonymous`).then(anonRes => {
          localStorage.setItem('token', anonRes.data.token);
          localStorage.setItem('user', JSON.stringify(anonRes.data.user));
          window.dispatchEvent(new Event('storage'));
          if (provider) {
            const newUser = { ...anonRes.data.user, joinedAt: Date.now() };
            provider.awareness.setLocalStateField('user', newUser);
          }
        }).catch(err => console.error("Failed to create anon user", err));
        syncParticipants();
      }    
    }else {
        if (isMounted) setParticipants([]);
    }
      docRef.current = doc;
    yLinesRef.current = yLines;
    yPinsRef.current = yPins;
    return () => {
        isMounted = false;
      provider?.disconnect();
      doc.destroy();
    };
  }, [roomId,navigate]);
useEffect(() => {
    if (roomId && roomOwnerId && participants.length > 0) {
      const ownerPresent = participants.find(p => p.user.id === roomOwnerId);
      
      if (!ownerPresent) {
        const timerId = setTimeout(() => {
          setOwnerLeft(true);
          closeRoom();
        }, 5 * 60 * 1000);
        
        return () => clearTimeout(timerId);
      } else {
        setOwnerLeft(false);
      }
    }
  }, [participants, roomOwnerId, roomId]);
  const kickUser = (userId: string) => {
    if (docRef.current) {
      docRef.current.getMap('kicked').set(userId, true);
    }
  };

const closeRoom = () => {
    
    axios.post(`${API_URL}/rooms/${roomId}/close`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(() => {
      navigate('/');
    });
  };


   return {
    lines,
    pins,
    participants,
    roomOwnerId,
    ownerLeft,
    setOwnerLeft,
    docRef,
    yLinesRef,
    yPinsRef,
    kickUser,
    closeRoom
  };
}
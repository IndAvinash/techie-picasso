import { UserX } from 'lucide-react';



export function RoomMenu({ participants, roomOwnerId, currentUser, closeRoom, createRoom , navigate, kickUser, setShowMenu}: any) {
  return (
    <div style={{
      position: 'absolute', top: '120%', right: '2%', background: '#ffffff', border: '1px solid #333', 
      borderRadius: '8px', padding: '12px', minWidth: '220px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#000000', borderBottom: '1px solid #000000', paddingBottom: '8px' }}>Participants</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {participants.map((p: any) => (
          <div key={p.clientID} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
            <span style={{ maxWidth: '140px', overflow: 'hidden', color: '#000000',textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.user.email}>
              {p.user.email} {p.user.id === currentUser?.id ? '(You)' : ''} {p.user.id === roomOwnerId ? '.': ''}
            </span>
            {roomOwnerId === currentUser?.id && p.user.id !== currentUser?.id && (
              <button 
                onClick={() => kickUser(p.user.id)} 
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
              >
                <UserX size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button 
        onClick={createRoom} 
        style={{ width: '100%', padding: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
        Create New Room
      </button>
      {roomOwnerId === currentUser?.id && (
        <button 
          onClick={()=>{
            navigate('/')
            closeRoom()
            setShowMenu()
          }} 
          style={{ width: '100%', padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', marginTop: '8px' }}
        >
          Close Room
        </button>
      )}
    </div>
  );
}
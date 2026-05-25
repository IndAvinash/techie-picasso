export function RoomClosedModal({ downloadCanvas, onExit }: any) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, 
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#1e1e24', padding: '32px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', border: '1px solid #444' }}>
        <h2 style={{ color: '#ff4444', marginTop: 0 }}>Room Closed</h2>
        <p style={{ color: '#ddd', marginBottom: '24px', lineHeight: '1.5' }}>
          The owner has left the room, so it has been closed. Please save your canvas before leaving.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            onClick={downloadCanvas}
            style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
          >
            Download Canvas
          </button>
          <button 
            onClick={onExit}
            style={{ padding: '10px 20px', background: 'transparent', color: '#ddd', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
          >
            Exit Room
          </button>
        </div>
      </div>
    </div>
  );
}

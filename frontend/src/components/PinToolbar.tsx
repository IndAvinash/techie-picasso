import React from 'react';

interface PinToolbarProps {
  tool: string;
  customPins: string[];
  selectedPinSrc?: string;
  setSelectedPinSrc: (src: string) => void;
  setShowPinCreator: (show: boolean) => void;
}

/**
 * Renders the floating toolbar for selecting and creating custom pins.
 * Only visible when the "Pin" tool is active.
 */
export function PinToolbar({ 
  tool, customPins, selectedPinSrc, setSelectedPinSrc, setShowPinCreator 
}: PinToolbarProps) {
  if (tool !== 'pin') return null;

  return (
    <div style={{ 
      position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)', 
      display: 'flex', gap: '8px', zIndex: 10, background: '#1e1e24', 
      padding: '8px', borderRadius: '8px', border: '1px solid #333' 
    }}>
      {/* Show a placeholder if the user hasn't created any custom pins yet */}
      {customPins.length === 0 && (
        <span style={{ color: '#aaa', fontSize: '14px', alignSelf: 'center' }}>
          No pins created
        </span>
      )}
      
      {/* Map through all created custom pins and display them as clickable thumbnails */}
      {customPins.map((src, i) => (
        <img 
          key={i} 
          src={src} 
          alt="pin" 
          style={{ 
            width: '32px', height: '32px', 
            border: selectedPinSrc === src ? '2px solid #3b82f6' : '1px solid transparent', 
            cursor: 'pointer', borderRadius: '4px', background: 'white' 
          }} 
          onClick={() => setSelectedPinSrc(src)} 
        />
      ))}
      
      {/* Button to open the Pin Creator modal */}
      <button 
        onClick={() => setShowPinCreator(true)} 
        style={{ 
          background: '#3b82f6', color: 'white', border: 'none', 
          borderRadius: '4px', cursor: 'pointer', padding: '0 8px', fontSize: '12px' 
        }}
      >
        + Create New
      </button>
    </div>
  );
}

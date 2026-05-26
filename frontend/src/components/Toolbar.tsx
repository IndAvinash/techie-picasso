import { Hand, Pen, Eraser, Pin } from "lucide-react";

interface ToolbarProps {
  tool: string;
  setTool: (t: 'pen' | 'eraser' | 'pin' | 'hand') => void;
  color: string;
  setColor: (c: string) => void;
}

/**
 * Renders the central toolbar where users can select their active drawing tool
 * and pick a color for the pen.
 */
export function Toolbar({ tool, setTool, color, setColor }: ToolbarProps) {
  return (
    <nav className="header-center">
      <div className="toolbar">
        {/* Color Picker for the Pen tool */}
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          className="color-picker" 
          title="Choose Color" 
        />
        
        {/* Pan Tool: Used to drag and move around the infinite canvas */}
        <button 
          className={`tool-btn ${tool === 'hand' ? 'active' : ''}`} 
          data-tooltip="pan" 
          onClick={() => setTool('hand')}
        >
          <Hand />
        </button>
        
        {/* Pen Tool: Standard drawing tool */}
        <button 
          className={`tool-btn ${tool === 'pen' ? 'active' : ''}`} 
          data-tooltip="draw" 
          onClick={() => setTool('pen')}
        >
          <Pen />
        </button>
        
        {/* Eraser Tool: Removes drawn lines using composite operations */}
        <button 
          className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`} 
          data-tooltip="erase" 
          onClick={() => setTool('eraser')}
        >
          <Eraser />
        </button>
        
        {/* Pin Tool: Used to drop custom image stickers onto the canvas */}
        <button 
          className={`tool-btn ${tool === 'pin' ? 'active' : ''}`} 
          data-tooltip="pin" 
          onClick={() => setTool('pin')}
        >
          <Pin />
        </button>
      </div>
    </nav>
  );
}

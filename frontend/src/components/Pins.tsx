import { useState, useEffect, useRef } from 'react';
import { Group, Image as KonvaImage, Circle, Text, Stage, Layer, Line } from 'react-konva';
import { MapPin, X } from 'lucide-react';

export type PinType = { id: string, src: string, x: number, y: number };

export const URLImage = ({ pin, isSelected, onClick, onDelete, onDragEnd }: { pin: PinType, isSelected: boolean, onClick: (e:any)=>void, onDelete: ()=>void, onDragEnd: (e: any) => void }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  
  useEffect(() => {
    const img = new window.Image();
    img.src = pin.src;
    img.onload = () => {
      setImage(img);
    };
  }, [pin.src]);

  return (
    <Group 
      x={pin.x} 
      y={pin.y} 
      draggable 
      onDragEnd={onDragEnd} 
      onClick={onClick} 
      onTap={onClick}
    >
      <KonvaImage image={image || undefined} x={-30} y={-30} width={60} height={60} />
      {isSelected && (
        <Group x={15} y={-45} onClick={(e) => { e.cancelBubble = true; onDelete(); }} onTap={(e) => { e.cancelBubble = true; onDelete(); }}>
          <Circle radius={12} fill="#ef4444" shadowColor="black" shadowBlur={5} shadowOpacity={0.2} />
          <Text text="✕" fill="white" x={-4.5} y={-4.5} fontSize={12} fontStyle="bold" />
        </Group>
      )}
    </Group>
  );
};

export function PinCreatorModal({ onClose, onSave }: { onClose: () => void, onSave: (url: string) => void }) {
  const [lines, setLines] = useState<any[]>([]);
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);
  const [color, setColor] = useState('#000000');

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y], color, strokeWidth: 5 }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleSave = () => {
    if (stageRef.current) {
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
      onSave(dataUrl);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', minWidth: '300px', color: '#000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="#3b82f6" /> Create Pin
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#555' }}>Draw your sticker:</span>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ cursor: 'pointer' }} />
          </div>
          
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', background: '#f9fafb' }}>
            <Stage
              width={250}
              height={250}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              ref={stageRef}
            >
              <Layer>
                {lines.map((line, i) => (
                  <Line key={i} points={line.points} stroke={line.color} strokeWidth={line.strokeWidth} tension={0.5} lineCap="round" lineJoin="round" />
                ))}
              </Layer>
            </Stage>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <button onClick={() => setLines([])} style={{ padding: '8px 16px', background: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Clear</button>
          <button onClick={handleSave} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save Pin</button>
        </div>
      </div>
    </div>
  );
}

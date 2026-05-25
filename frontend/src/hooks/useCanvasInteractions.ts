import { useState, useRef } from "react";


type LineType = { points: number[]; color: string; strokeWidth: number; tool: 'pen' | 'eraser' | 'pin' | 'hand' }

export function useCanvasInteractions(
      tool: 'pen' | 'eraser' | 'pin' | 'hand',
  color: string,
  setLines: React.Dispatch<React.SetStateAction<LineType[]>>,
  lines: LineType[]
) {
     const [stageScale, setStageScale] = useState(1);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const isDrawing = useRef(false);
const handleWheel = (e:any)=>{
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (e.evt.ctrlKey) {
      const scaleBy = 1.05;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };
      const newScale = e.evt.deltaY < 0 ? ((oldScale * scaleBy) > 16 ? 16 : oldScale * scaleBy) : ((oldScale / scaleBy) < 0.1 ? 0.1 : (oldScale / scaleBy));
      setStageScale(newScale);
      setStagePos({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    } else {
      setStagePos((prev) => ({
        x: prev.x - e.evt.deltaX,
        y: prev.y - e.evt.deltaY,
      }));
    }
}
 const getRelativePointerPosition = (stage: any) => {
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    return transform.point(pos);
  };

const handleMouseDown = (e:any)=>{
    isDrawing.current  = tool==='eraser' ? true : tool === 'pen' ? true : false;    
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    setLines([...lines, { points: [pos.x, pos.y], color, strokeWidth: tool === 'pen' ? 5 : 20, tool: tool as LineType['tool'] }]);
    
}
const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    
    const nextLines = [...lines];
    const lastLine = { ...nextLines[nextLines.length - 1] };
    
    lastLine.points = lastLine.points.concat([pos.x, pos.y]);
    nextLines[nextLines.length - 1] = lastLine;
    
    setLines(nextLines);
  };

const handleMouseUp = () => {
    isDrawing.current = false;
  };
   return {
    stageScale,
    stagePos,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}
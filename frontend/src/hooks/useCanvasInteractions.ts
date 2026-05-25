import { useState, useRef } from "react";
import type { LineType } from "./useYJsRoom";
import * as Y from 'yjs';
export function useCanvasInteractions(
      tool: 'pen' | 'eraser' | 'pin' | 'hand',
  color: string,
   docRef: React.MutableRefObject<Y.Doc | null>,
  yLinesRef: React.MutableRefObject<Y.Array<LineType> | null>,
) {
     const [stageScale, setStageScale] = useState(1);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const isDrawing = useRef(false);

  const getRelativePointerPosition = (stage: any) => {
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    return transform.point(pos);
  };

  const handleWheel = (e: any) => {
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
  };

  const handleMouseDown = (e: any) => {
    isDrawing.current = (tool === 'pen' || tool === 'eraser');
    
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);


    if (!isDrawing.current || !yLinesRef.current) return;
    
    const newLine: LineType = { 
      points: [pos.x, pos.y], 
      color, 
      strokeWidth: tool === 'pen' ? 5 : 20, 
      tool 
    };
    yLinesRef.current.push([newLine]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || !yLinesRef.current) return;
    
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    
    const yLines = yLinesRef.current;
    if (yLines.length === 0) return;

    const lastIndex = yLines.length - 1;
    const lastLine = yLines.get(lastIndex);
    
    const updatedLine = {
      ...lastLine,
      points: lastLine.points.concat([pos.x, pos.y])
    };
    
    docRef.current?.transact(() => {
      yLines.delete(lastIndex, 1);
      yLines.insert(lastIndex, [updatedLine]);
    });
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
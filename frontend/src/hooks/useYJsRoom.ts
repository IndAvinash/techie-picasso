import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useEffect, useRef, useState } from 'react';
export type LineType = { points: number[]; color: string; strokeWidth: number; tool: 'pen' | 'eraser' | 'pin' | 'hand' }
export function useYJsRoom(roomName: string) {
  const [doc, setdoc] = useState<Y.Doc | null>(null);
   const [lines, setLines] = useState<LineType[]>([]);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const docRef = useRef<Y.Doc | null>(null);
    const YLinesRef = useRef<Y.Array<LineType> | null>(null);
  useEffect(() => {
    setLines([]);
    const doc = new Y.Doc();
    const provider = new WebsocketProvider('ws://localhost:3000', roomName, doc);
    providerRef.current = provider;
    setdoc(doc);
    setProvider(provider);
    const yLines = doc.getArray<LineType>('lines');
    YLinesRef.current = yLines;
    docRef.current = doc;
    yLines.observe(() => {
         setLines(yLines.toArray());
    });
    return () => {
      provider.disconnect();
      doc.destroy();
    };
  }, [roomName]);

  return { lines,docRef,YLinesRef };
}
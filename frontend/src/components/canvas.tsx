import {useRef, useEffect} from 'react'
import Header from './header';
export default function Canvas(){
const cRef = useRef<HTMLCanvasElement|null>(null);

 
 const resizeCanvas = () => {
    const canvas = cRef.current;
   
  
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
   
    }

  


useEffect(
    ()=>{
        resizeCanvas()
        document.addEventListener('resize',resizeCanvas)
        return(()=>{document.removeEventListener("resize",resizeCanvas)})

    },[]
)


return(
    <>
    <Header/>
    <canvas ref={cRef}></canvas>
    </>
)
}
import './App.css'
import Canvas from './components/canvas'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login'
import SignUp from './pages/SignUp'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
     <BrowserRouter>
<Routes>
<Route path="/" element={<Canvas/>} />
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<SignUp />} />
</Routes>
</BrowserRouter>
    </>
  )
}

export default App

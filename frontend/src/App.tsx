import './App.css'
import Canvas from './components/canvas'
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Verify from './pages/Verify'

function App() {

  return (
    <>
     <BrowserRouter>
<Routes>
<Route path="/" element={<Canvas/>} />
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<SignUp />} />
<Route path="/verify" element={<Verify />} />
</Routes>
</BrowserRouter>
    </>
  )
}

export default App

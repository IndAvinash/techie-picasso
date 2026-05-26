import './App.css'
import Canvas from './components/canvas'
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Verify from './pages/Verify'
import axios from 'axios';
import { useEffect, useState } from 'react';
async function isAuthenticated() {

  const token = localStorage.getItem('token');
  return true;
  const res = await axios.post('http://localhost:3000/auth/auth', {}, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (res.status === 200) {
   
  }else{
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
}

function App() {
  const [isAuth, setIsAuth] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      setIsAuth(auth);
    };
    checkAuth();
  }, []);
  return (
    <>
     <BrowserRouter>
<Routes>
<Route path="/" element={ isAuth ? <Canvas /> : <Login />} />
<Route path="/login" element={<Login />} />
<Route path="/room/:roomId" element={<Canvas/>} />
<Route path="/signup" element={<SignUp />} />
<Route path="/verify" element={<Verify />} />
</Routes>
</BrowserRouter>
    </>
  )
}

export default App

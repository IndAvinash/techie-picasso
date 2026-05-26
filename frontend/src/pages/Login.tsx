import { useState, useEffect, useRef } from "react";
import axios from 'axios';
const API_URL = 'http://localhost:3000';
import { useNavigate } from "react-router-dom";



export default function Login() {
    const navigate = useNavigate();
 const[email,setEmail] = useState("");
 const[password,setPassword] = useState("");


 return(
    <>
    <div className="formPg">
       <form className="login-form" onSubmit={(e)=>{e.preventDefault()}}>
        <h2>Login</h2>
        <label >Email</label>
        <input type="email" placeholder="abc@gmail.com"  value={email} className="input-email" onChange={(e)=>{setEmail(e.target.value)}} required/>
        <label>Password</label>
        <input type="password" placeholder="••••••••" value={password} className="input-password" onChange={(e)=>{setPassword(e.target.value)}}  required/>
        
        <input type="submit" value="Login" onClick={async (e)=>{
            e.preventDefault();
            try {
                const res = await axios.post(`${API_URL}/auth/login`, { email, password });
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/');
                alert('Login successful');
            } catch (err: any) {
                alert(err.response?.data?.error || 'Login failed');
                
            }
        }} />
        <br />
        <p>Don't have Account <span onClick={()=>navigate("/SignUp")} className="anchor">SignUp</span></p>
        </form> 
</div>
    </>
 )

}
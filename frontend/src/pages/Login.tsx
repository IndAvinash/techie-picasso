import { useState, useEffect, useRef } from "react";
// import { Header } from "../components/header";
import { Link } from "react-router-dom";
import { login } from "../services/api";
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
        
        <input type="submit" value="Login" onClick={(e)=>{ }} />
        <br />
        <p>Don't have Account <span onClick={()=>navigate("/SignUp")} className="anchor">SignUp</span></p>
        </form> 
</div>
    </>
 )

}
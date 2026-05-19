import { useState, useEffect, useRef } from "react";
// import { Header } from "../components/header";
import { Link } from "react-router-dom";
import { login } from "../services/api";
import { useNavigate } from "react-router-dom";



export default function SignUp() {
    const navigate = useNavigate();
 const[email,setEmail] = useState("");
 const[password,setPassword] = useState("");
 const[cnfmpassword,setCnfmPassword] = useState("");



 return(
    <>
    <div className="formPg">
       <form className="login-form" onSubmit={(e)=>{e.preventDefault()}}>
        <h2>SignUp</h2>
        <label >Email</label>
        <input type="email" placeholder="abc@gmail.com"  value={email} className="input-email" onChange={(e)=>{setEmail(e.target.value)}} required/>
        <label>Password</label>
        <input type="password" placeholder="••••••••" value={password} className="input-password" onChange={(e)=>{setPassword(e.target.value)}}  required/>
        <label>Confirm Password</label>
        <input type="text" placeholder="mypassword" value={cnfmpassword} className="input-password" onChange={(e)=>{setCnfmPassword(e.target.value)}}  required/>
        
        <input type="submit" value="SignUp" onClick={(e)=>{}} />
        <br />
        <p>Already have Account <span onClick={()=>navigate("/Login")} className="anchor">Login</span></p>
        </form> 
        </div>

    </>
 )

}
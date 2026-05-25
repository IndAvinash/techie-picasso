import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export default function Verify() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("Verifying your email...");

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setStatus("Invalid link. No token found.");
            return;
        }

        axios.get(`${API_URL}/auth/verify?token=${token}`)
            .then((res) => {
                setStatus("Email verified successfully! Redirecting to login...");
                setTimeout(() => navigate('/login'), 3000);
            })
            .catch((err) => {
                setStatus(err.response?.data?.error || "Failed to verify email.");
            });
    }, [searchParams, navigate]);

    return (
        <div className="formPg" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="login-form" style={{ textAlign: 'center' }}>
                <h2>Email Verification</h2>
                <p>{status}</p>
            </div>
        </div>
    );
}

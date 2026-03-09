import React, { useState} from 'react';
import type { FormEvent } from 'react';
import axios from "axios";
import "../App.css";
import api from '../api/axios';
import { useAuth } from './authContext';

interface LoginComponentProps {
    toggle: () => void;
}

const LoginComponent: React.FC<LoginComponentProps> = (props) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const {setAuthFromToken} = useAuth();

    function handleLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        api.post(`/api/Auth/login`, {
            username: username,
            password: password
        })
        .then(response => {
            // Suscess response
            const accessToken = response.data.accessToken;
            localStorage.setItem('accessToken', accessToken);
            setAuthFromToken(accessToken);
            alert('Login succesful:');
            props.toggle()
        })

        .catch(error => {
            // Handle error response
            if (axios.isAxiosError(error)) {
                console.error('Login error:', error.response?.data || error.message);
                alert('Login failed: ' + (error.response?.data?.message || 'Please try again.'));
            } else {
                console.error('Unexpected error:', error);
                alert('An unexpected error occurred.');
            }
        });
    }

    return (
        <div className="popup">
            <div className="popup-inner">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <label>
                        Username:
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                    </label>
                    <label>
                        Password:
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </label>
                    <button type="submit">Login</button>
                </form>
                <button onClick={props.toggle}>Close</button>
            </div>
        </div>
    )
}

export default LoginComponent;
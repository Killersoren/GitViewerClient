import React, { useState} from 'react';
import type { FormEvent } from 'react';
import axios from "axios";
import api from '../api/axios';
import "../App.css";

interface RegisterComponentProps {
    toggle: () => void;
}

const RegisterComponent: React.FC<RegisterComponentProps> = (props) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    function handleLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        api.post(`/api/Auth/register`, {
            username: username,
            password: password
        })
        .then(response => {
            // Suscess response
            console.log('Account registered succesfully!:', response.data);
            props.toggle()
        })

        .catch(error => {
            // Handle error response
            if (axios.isAxiosError(error)) {
                console.error('Account registration error:', error.response?.data || error.message);
                alert('Account creation failed: ' + (error.response?.data?.message || 'Please try again.'));
            } else {
                console.error('Unexpected error:', error);
                alert('An unexpected error occurred.');
            }
        });    
    
    }

    return (
        <div className="popup">
            <div className="popup-inner">
                <h2>Register</h2>
                <form onSubmit={handleLogin}>
                    <label>
                        Username:
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                    </label>
                    <label>
                        Password:
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </label>
                    <button type="submit">Register</button>
                </form>
                <button onClick={props.toggle}>Close</button>
            </div>
        </div>
    )
}

export default RegisterComponent;
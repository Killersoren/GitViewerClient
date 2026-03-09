import { useState } from 'react'
import "../../App.css";
import LoginComponent from '../LoginComponent';
import RegisterComponent from '../RegisterComponent';
import SeasonalImage from '../SeasonalImage';

const LoginPage: React.FC = () => {
    
    const [popupType, setPopupType] = useState<'login' | 'register' | null>(null);
    function togglePop () {
    setPopupType(null)
     };

  return (
    <>
      <h1>Omegacentralen - GitViewer</h1>

      <div className="card">
        <button onClick={() => setPopupType('login')}>Login</button>
        <button onClick={() => setPopupType('register')}>Register</button>

        {popupType === 'login' && <LoginComponent toggle={togglePop} />}
        {popupType === 'register' && <RegisterComponent toggle={togglePop} />}
      </div>
      <br/>
      <SeasonalImage imageKey="TorbenHD" className="logo" alt="Torben logo" />
      </>
  )
}

export default LoginPage;
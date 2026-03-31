import "../../App.css";
import { useAuth } from '../authContext';
import api from "../../api/axios";
import UserRepos from "../RepoStuff/UserRepoListComponent";
import ShareLinks from "../SharelinkStuff/ShareLinkListComponent";
import VisitorsPage from "./VisitorsPage";
import { useState } from 'react'
import SeasonalImage from '../SeasonalImage';

const MainPage: React.FC = () => {

  const { auth, setAuth } = useAuth();
  const [popupType, setPopupType] = useState<'repositories' | 'visits' | 'Sharelinks' | null>("repositories");
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  function handleLogout(){
    api.post('/api/Auth/logout')
    .then(()=> {
      localStorage.removeItem('accessToken');
      setAuth({isLoggedIn: false});
    })
    .catch((error) => {
      console.error("Logout failed", error);
    });
  }

  const handleCopyPublicLink = () => {
    if (!auth.userId) {
      alert("User ID not available");
      return;
    }
    const userIdWithoutDashes = auth.userId.replace(/-/g, '');
    const publicLink = `${window.location.origin}/user/${userIdWithoutDashes}`;
    navigator.clipboard.writeText(publicLink).then(() => {
      setCopiedUserId(auth.userId || null);
      setTimeout(() => setCopiedUserId(null), 2000);
    });
  };

  if (auth.role === 'Unverified') {
    return (
      <>
        <button onClick={() => handleLogout()}>Logout</button>
        <p>This is a test demoapp, your account is not verified.</p>
      </>
    );
  }

  return (
    <>
      <button onClick={() => handleLogout()}>Logout</button>
      <div>
        <h1>Welcome {auth.username} you are a {auth.role}</h1>
        {auth.role === 'Admin' && <div> Admin Panel</div>}
        <div>Main content for logged-in users</div>
      </div>

      <button onClick={() => setPopupType('repositories')}>Repositories</button>
      <button onClick={() => setPopupType('Sharelinks')}>Sharelinks</button>
      <button onClick={() => setPopupType('visits')}>Visits</button>

      <div>
        <p>
        <button onClick={handleCopyPublicLink} style={{ 
          marginLeft: '8px', 
          color: copiedUserId ? 'green' : 'white'
        }}>

          {copiedUserId ? "Copied!" : "Copy Public Profile Link"}
        </button>
        </p>
      </div>

      <div>
        {popupType === 'Sharelinks' && <ShareLinks/>}
        {popupType === 'repositories' && <UserRepos/>}
        {popupType === 'visits' && <VisitorsPage/>}
      </div>
      <SeasonalImage imageKey="TorbenHD" className="logo" alt="Torben logo" />
    </>
  );
}

export default MainPage;
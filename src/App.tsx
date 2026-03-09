import { useAxiosAuth } from './api/useAxiosAuth';
import './App.css'
import { useAuth } from './components/authContext';
import LoginPage from './components/pages/LoginPage';
import MainPage from './components/pages/MainPage';
import RepoPage from './components/pages/RepoPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VisitorsPage from './components/pages/VisitorsPage';
import PublicUserRepos from './components/RepoStuff/PublicRepoListComponent';

function App() {
  useAxiosAuth();
  const { auth } = useAuth();

  return (
    <Router>
      <Routes>
            <Route path="/repo/:repoId" element={<RepoPage />} />       
            <Route path="/user/:userId" element={<PublicUserRepos/>} />

            <Route path="/visitors" element={<VisitorsPage />} />

        {auth.isLoggedIn ? (
          <Route path="/*" element={<MainPage />} />
        ) : (
          <Route path="/*" element={<LoginPage />} />
        )}
      </Routes>
    </Router>
  );
}

export default App
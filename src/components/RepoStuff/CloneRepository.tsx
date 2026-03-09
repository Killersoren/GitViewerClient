import React from 'react';
import axios from 'axios';
import api from '../../api/axios';
import { useAuth } from '../authContext';

interface CreateDeployKeyProps {
  repoId: string;
  onSuccess?: () => void;
  refreshRepos?: () => void
}

const CloneRepository: React.FC<CreateDeployKeyProps> = ({ repoId, onSuccess, refreshRepos }) => {
  const { isProcessing, setIsProcessing } = useAuth();
  const handleGenerateDeployKey = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("accessToken");

       await api.post(`/api/Repo/clone-repo?repoId=${repoId}`,           
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
          
        })   

      console.log("Repository cloned for repo" + repoId);
      if (refreshRepos) refreshRepos();
      if (onSuccess) onSuccess();

      alert("Repository cloned")

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('Clone repository failed:', error.response?.data || error.message);
        alert('Clone repository failed: ' + (error.response?.data?.message || 'Please try again.'));
      } else {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button onClick={handleGenerateDeployKey} disabled={isProcessing}>
    Build repository
    </button>
  );
};

export default CloneRepository;

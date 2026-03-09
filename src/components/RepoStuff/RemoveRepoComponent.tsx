import React from 'react';
import axios from 'axios';
import api from '../../api/axios';
import { useAuth } from '../authContext';

interface RemoveRepoComponentProps {
  repoId: string;
  onSuccess?: () => void;
  refreshRepos?: () => void
}

const RemoveRepoComponent: React.FC<RemoveRepoComponentProps> = ({ repoId, onSuccess, refreshRepos }) => {
  const { isProcessing, setIsProcessing } = useAuth();
  const handleRemove = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("accessToken");

      await api.delete("/api/Repo/delete-repo", 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            repoId: repoId,
          },
        }
      );

      console.log("Repository removed " + repoId);
      if (refreshRepos) refreshRepos();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('Repo deletion error:', error.response?.data || error.message);
        alert('Repo deletion failed: ' + (error.response?.data?.message || 'Please try again.'));
      } else {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button onClick={handleRemove} disabled={isProcessing}>
      Delete Repository
    </button>
  );
};

export default RemoveRepoComponent;

import React from 'react';
import axios from 'axios';
import api from '../../api/axios';
import { useAuth } from '../authContext';

interface RemoveShareLinkComponentProps {
  shareLinkId: string;
  onSuccess?: () => void;
  refreshShareLinks?: () => void
}

const RemoveShareLinkComponent: React.FC<RemoveShareLinkComponentProps> = ({ shareLinkId: ShareLinkId, onSuccess, refreshShareLinks: refreshShareLinks }) => {
  const { isProcessing, setIsProcessing } = useAuth();
  const handleRemove = async () => {
    if (!window.confirm("Delete this share link? This action cannot be undone.")) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("accessToken");

      await api.delete("/api/ShareLink/delete-sharelink/", 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            shareLinkId: ShareLinkId,
          },
        }
      );

      console.log("Sharelink removed " + ShareLinkId);
      if (refreshShareLinks) refreshShareLinks();
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Sharelink deletion error:', error.response?.data || error.message);
        alert('Sharelink deletion failed: ' + (error.response?.data?.message || 'Please try again.'));
      } else {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button className="button button-danger" onClick={handleRemove} disabled={isProcessing}>
      Delete Sharelink
    </button>
  );
};

export default RemoveShareLinkComponent;

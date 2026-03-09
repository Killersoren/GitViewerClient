import React from 'react';
import api from '../../api/axios';
import { createAndCloneRepo } from '../../services/RepoService';
import { useAuth } from '../authContext';

interface ConvertToSShProps {
  repoId: string;
  repoSource?: string;
  onSuccess?: () => void;
  refreshRepos?: () => void;
  closeParent?: () => void;
}

const toSshUrl = (source: string) => {
  try {
    const u = new URL(source);
    const host = u.hostname;
    let path = u.pathname.replace(/^\/+/, '');
    return `git@${host}:${path}`;
  } catch {
    return source;
  }
};

const ConvertToSSh: React.FC<ConvertToSShProps> = ({ repoId, repoSource, onSuccess, refreshRepos, closeParent}) => {
  const { isProcessing, setIsProcessing } = useAuth();

  const handleConvertToSSH = async () => {
    if (!repoSource) {
      alert("No repository source available to convert.");
      return;
    }
    setIsProcessing(true);
    const token = localStorage.getItem("accessToken");
    try {
      // delete old repo first
      await api.delete(`/api/Repo/delete-repo?repoId=${repoId}`, { headers: { Authorization: `Bearer ${token}` } });

      const sshUrl = toSshUrl(repoSource);
      const result = await createAndCloneRepo(sshUrl);

      if (result.repo) {
        if (result.status === "OK") {
          sessionStorage.removeItem(`deployKey:${result.repo.id}`);
        }

        if (refreshRepos) refreshRepos();
        if (onSuccess) onSuccess();
        if (closeParent) closeParent();
      } else {
        alert(result.message || "Failed to create repo after conversion.");
      }
    } catch (err: any) {
      console.error("ConvertToSSH failed:", err);

    } finally {
      setIsProcessing(false);
    }
  };

  return <button onClick={handleConvertToSSH} disabled={isProcessing}>{isProcessing ? "Converting…" : "Convert to SSH"}</button>;
};

export default ConvertToSSh;

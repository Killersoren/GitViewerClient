import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../../api/axios";
import type { Repository } from "../../types/Repository";
import RemoveRepoComponent from "./RemoveRepoComponent";
import CloneRepository from "./CloneRepository";
import ConvertToSSh from "./ConvertToSSH";
import { useAuth } from "../authContext";

// Shows additional information and actions for a selected repository
interface Props {
  repo: Repository;
  onClose: () => void;
  refreshRepos?: () => void;
  message?: string | null;
  closeParent?: () => void;
}

export const RepoDetailsComponent: React.FC<Props> = ({ repo, onClose, refreshRepos, message, closeParent }) => {
  const [deployKey, setDeployKey] = useState<string | null>(null);
  const { isProcessing } = useAuth();

  const handleOpenTree = () => {
    window.open(`/repo/${repo.id}`, "_blank", "noopener,noreferrer");
  };

  const status = (repo as any)?.status;
  const repoMessage = message ?? (repo as any)?.message ?? null;
  const isHttps =
    typeof repo.source === "string" && (repo.source.startsWith("http://") || repo.source.startsWith("https://"));
  const isSsh = typeof repo.source === "string" && (repo.source.startsWith("git@") || repo.source.startsWith("ssh://"));


    async function fetchDeployKey() {
    if (!isSsh) return;
    const cached = sessionStorage.getItem(`deployKey:${repo.id}`);
    if (cached) {
      setDeployKey(cached);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.post(`/api/Repo/generate-deploy-key?repoId=${repo.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const key = res.data?.publicKey ?? res.data?.publickey ?? null;
      if (key) {
        setDeployKey(key);
        sessionStorage.setItem(`deployKey:${repo.id}`, key);
      }
    } catch (err: any) {
      
      if (axios.isAxiosError(err) && err.response?.status === 404) {


      } else {
        console.error("Failed to fetch deploy key:", err);
      }
    } 
  }

  useEffect(() => {
    fetchDeployKey();
  }, [repo.id]);

  const handleCloseAll = () => {
    onClose();
    if (closeParent) closeParent();
  };

  return (
    <div className="popup">
      <div className="popup-inner">
        <h2>{repo.name}</h2>
        <p><strong>Name:</strong> {repo.name}</p>
        <p><strong>Source URL:</strong> {repo.source}</p>
        <p><strong>Created:</strong> {new Date(repo.created).toLocaleString()}</p>
        <p><strong>Updated:</strong> {new Date(repo.updated).toLocaleString()}</p>
        <p><strong>Sharable:</strong> {repo.isPublic ? "Yes" : "No"}</p>

        {status === "CloneFailed" && (
          <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #b30000", backgroundColor: "#360000ff" }}>
            <strong>Attention:</strong>
            <p>{repoMessage ?? "Repository clone failed."}</p>

            {isHttps && (
              <p>
                Cloning failed. The repository might be private or the URL is incorrect. You can convert it to an SSH link using the button.
              </p>
            )}

            {isSsh && (
              <>
                <p>
                  Cloning failed. A deploy key has been generated. Please add the following deploy key to your repository:
                  {deployKey}
                </p>
              </>
            )}
          </div>
        )}

        {message && (
          <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid red", backgroundColor: "#360000ff" }}>
            <strong>Attention:</strong>
            <p>{message}</p>
          </div>
        )}

        <RemoveRepoComponent
          repoId={repo.id}
          onSuccess={() => {
            onClose();
            setTimeout(() => {
              if (refreshRepos) refreshRepos();
            }, 100);
          }}
        />

        <CloneRepository
          repoId={repo.id}
          onSuccess={() => {
            onClose();
            setTimeout(() => {
              if (refreshRepos) refreshRepos();
            }, 100);
          }}
        />

        <ConvertToSSh
          repoId={repo.id}
          repoSource={repo.source}
          onSuccess={() => {
            handleCloseAll();
            setTimeout(() => {
              if (refreshRepos) refreshRepos();
            }, 100);
          }}
        />

        <button onClick={handleOpenTree} disabled={isProcessing}>View</button>
        <button onClick={handleCloseAll} disabled={isProcessing}>Close</button>
        {isProcessing && <div>Processing...</div>}
      </div>
    </div>
  );
};

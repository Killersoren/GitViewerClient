import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../../api/axios";
import type { Repository } from "../../types/Repository";
import RemoveRepoComponent from "./RemoveRepoComponent";
import CloneRepository from "./CloneRepository";
import ConvertToSSh from "./ConvertToSSH";
import { useAuth } from "../authContext";

function getGitHubDeployKeysUrl(source: string): string | null {
  try {
    let repositoryUrl: URL;
    const scpUrl = source.match(/^git@([^:]+):(.+)$/);
    if (scpUrl) {
      repositoryUrl = new URL(`https://${scpUrl[1]}/${scpUrl[2]}`);
    } else {
      repositoryUrl = new URL(source);
    }

    if (repositoryUrl.hostname !== "github.com") return null;

    const pathParts = repositoryUrl.pathname.split("/").filter(Boolean);
    if (pathParts.length !== 2) return null;

    const [owner, repository] = pathParts;
    const repositoryName = repository.replace(/\.git$/i, "");
    if (!repositoryName) return null;

    return `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repositoryName)}/settings/keys/new`;
  } catch {
    return null;
  }
}

interface Props {
  repo: Repository;
  onClose: () => void;
  refreshRepos?: () => void;
  message?: string | null;
  closeParent?: () => void;
}

export const RepoDetailsComponent: React.FC<Props> = ({
  repo,
  onClose,
  refreshRepos,
  message,
  closeParent,
}) => {
  const [deployKey, setDeployKey] = useState<string | null>(null);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedDeployKey, setCopiedDeployKey] = useState(false);
  const [deployKeyCopyError, setDeployKeyCopyError] = useState<string | null>(null);
  const { isProcessing } = useAuth();

  const status = repo.status;
  const repoMessage = message ?? repo.message ?? null;
  const isHttps = /^https?:\/\//i.test(repo.source);
  const isSsh = repo.source.startsWith("git@") || repo.source.startsWith("ssh://");
  const deployKeysUrl = getGitHubDeployKeysUrl(repo.source);

  useEffect(() => {
    let active = true;

    async function fetchDeployKey() {
      if (!isSsh) return;
      const cached = sessionStorage.getItem(`deployKey:${repo.id}`);
      if (cached) {
        setDeployKey(cached);
        return;
      }

      try {
        const res = await api.post(`/api/Repo/generate-deploy-key?repoId=${repo.id}`);
        const key = res.data?.publicKey ?? res.data?.publickey ?? null;
        if (key && active) {
          setDeployKey(key);
          sessionStorage.setItem(`deployKey:${repo.id}`, key);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status !== 404) {
          console.error("Failed to fetch deploy key:", err);
        }
      }
    }

    void fetchDeployKey();
    return () => {
      active = false;
    };
  }, [isSsh, repo.id]);

  function handleCloseAll() {
    onClose();
    closeParent?.();
  }

  async function handleToggleVisibility() {
    setVisibilityError(null);
    try {
      await api.post(`/api/Repo/toggle-public?repoId=${repo.id}&isPublic=${!repo.isPublic}`, {});
      refreshRepos?.();
      onClose();
    } catch (error) {
      console.error("Failed to update repository visibility", error);
      setVisibilityError("Could not update repository visibility. Please try again.");
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/repo/${repo.id}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy repository link", error);
      setVisibilityError("Could not copy the repository link. Check clipboard permissions and try again.");
    }
  }

  async function handleCopyDeployKey() {
    if (!deployKey) return;
    setDeployKeyCopyError(null);
    try {
      await navigator.clipboard.writeText(deployKey);
      setCopiedDeployKey(true);
      window.setTimeout(() => setCopiedDeployKey(false), 2000);
    } catch (error) {
      console.error("Failed to copy deploy key", error);
      setDeployKeyCopyError("Could not copy the SSH key. Check clipboard permissions and try again.");
    }
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !isProcessing) handleCloseAll();
  }

  return (
    <div className="popup" onMouseDown={handleBackdropClick}>
      <div className="popup-inner" role="dialog" aria-modal="true" aria-labelledby="repo-detail-title">
        <button
          className="dialog-close"
          type="button"
          onClick={handleCloseAll}
          disabled={isProcessing}
          aria-label="Close repository details"
        >
          ×
        </button>
        <span className="eyebrow">Repository details</span>
        <h2 id="repo-detail-title">{repo.name}</h2>

        <dl className="detail-grid">
          <dt>Source</dt>
          <dd title={repo.source}>{repo.source}</dd>
          <dt>Created</dt>
          <dd>{new Date(repo.created).toLocaleString("sv-SE")}</dd>
          <dt>Last updated</dt>
          <dd>{new Date(repo.updated).toLocaleString("sv-SE")}</dd>
          <dt>Visibility</dt>
          <dd>
            <span className={`status-badge ${repo.isPublic ? "status-public" : "status-private"}`}>
              {repo.isPublic ? "Public" : "Private"}
            </span>
          </dd>
        </dl>

        {status === "CloneFailed" && (
          <div className="alert-box" role="status">
            <strong>Repository build failed</strong>
            <p>{repoMessage ?? "The repository could not be cloned."}</p>
            {isHttps && <p>Check that the URL is correct and that the repository is accessible. Try converting the URL to an SSH URL with the button below, if the repository is private.</p>}
            {isSsh && deployKey && (
              <>
                <p>Add this deploy key to your Git hosting provider, then try building again.</p>
                <code>{deployKey}</code>
                <div className="detail-actions">
                  <button className="button button-secondary" type="button" onClick={handleCopyDeployKey}>
                    {copiedDeployKey ? "Key copied" : "Copy SSH key"}
                  </button>
                  {deployKeysUrl && (
                    <a
                      className="button button-secondary"
                      href={deployKeysUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open GitHub deploy keys
                    </a>
                  )}
                </div>
                {deployKeyCopyError && <p role="alert">{deployKeyCopyError}</p>}
              </>
            )}
          </div>
        )}
        {message && status !== "CloneFailed" && (
          <div className="alert-box" role="alert">{message}</div>
        )}
        {visibilityError && <p className="error-state" role="alert">{visibilityError}</p>}

        <div className="detail-actions">
          <button className="button button-primary" onClick={() => window.open(`/repo/${repo.id}`, "_blank", "noopener,noreferrer")}>
            View repository
          </button>
          <button className="button button-secondary" onClick={handleCopyLink}>
            {copied ? "Link copied" : "Copy link"}
          </button>
            {!isSsh && status === "CloneFailed" && (
              <ConvertToSSh
                repoId={repo.id}
                repoSource={repo.source}
                onSuccess={() => {
                  handleCloseAll();
                  refreshRepos?.();
                }}
              />
            )}
          <div className="action-menu-content">
            <CloneRepository
              repoId={repo.id}
              onSuccess={() => {
                onClose();
                refreshRepos?.();
              }}
            />
            <button className="button button-secondary" onClick={handleToggleVisibility} disabled={isProcessing}>
              Make {repo.isPublic ? "private" : "public"}
            </button>
            <RemoveRepoComponent
              repoId={repo.id}
              onSuccess={() => {
                onClose();
                refreshRepos?.();
              }}
            />
          </div>
        </div>
        {isProcessing && <p className="loading-state">Working…</p>}
      </div>
    </div>
  );
};

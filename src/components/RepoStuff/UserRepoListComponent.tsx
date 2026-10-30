import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import CreateRepoComponent from "./CreateRepoComponent";
import { RepoDetailsComponent } from "./RepoDetailsComponent";
import type { Repository } from "../../types/Repository";

export default function UserRepos() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedRepoId, setCopiedRepoId] = useState<string | null>(null);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);

  const fetchRepos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Repository[]>("/api/Repo/get-all-user-repos");
      setRepos(response.data);
    } catch (err) {
      console.error("Failed to fetch repositories", err);
      setError("Could not load repositories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRepos();
  }, [fetchRepos]);

  function closeCreateDialog() {
    setIsCreating(false);
  }

  async function handleCopyRepoLink(repo: Repository) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/repo/${repo.id}`);
      setCopiedRepoId(repo.id);
      window.setTimeout(() => setCopiedRepoId(null), 2000);
    } catch (copyError) {
      console.error("Failed to copy repository link", copyError);
      setVisibilityError("Could not copy the repository link. Check clipboard permissions and try again.");
    }
  }

  async function handleToggleVisibility(repo: Repository) {
    setVisibilityError(null);
    try {
      const newIsPublic = !repo.isPublic;
      await api.post(`/api/Repo/toggle-public?repoId=${repo.id}&isPublic=${newIsPublic}`, {});
      setRepos((currentRepos) =>
        currentRepos.map((currentRepo) =>
          currentRepo.id === repo.id ? { ...currentRepo, isPublic: newIsPublic } : currentRepo
        )
      );
    } catch (requestError) {
      console.error("Failed to update repository visibility", requestError);
      setVisibilityError(`Could not change visibility for ${repo.name}. Please try again.`);
    }
  }

  return (
    <div>
      <div className="list-heading">
        <button className="button button-primary" onClick={() => setIsCreating(true)}>
          Add repository
        </button>
      </div>

      {error && <p className="error-state" role="alert">{error}</p>}
      {visibilityError && <p className="error-state" role="alert">{visibilityError}</p>}
      {isLoading && <p className="loading-state">Loading repositories…</p>}
      {!isLoading && !error && repos.length === 0 && (
        <p className="empty-state">No repositories yet. Add one to get started.</p>
      )}
      {!isLoading && !error && repos.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Source</th>
                <th scope="col">Created</th>
                <th scope="col">Share</th>
                <th scope="col">Repository status</th>
              </tr>
            </thead>
            <tbody>
              {repos.map((repo) => (
                <tr
                  key={repo.id}
                  tabIndex={0}
                  onClick={() => setSelectedRepo(repo)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedRepo(repo);
                    }
                  }}
                  aria-label={`View ${repo.name} repository details`}
                >
                  <td>
                    <span className="table-primary">
                      {repo.name}
                    </span>
                  </td>
                  <td><span className="table-secondary" title={repo.source}>{repo.source}</span></td>
                  <td>{new Date(repo.created).toLocaleDateString("sv-SE")}</td>
                  <td>
                    <button
                      className="button button-secondary table-action"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleCopyRepoLink(repo);
                      }}
                    >
                      {copiedRepoId === repo.id ? "Link copied" : "Share"}
                    </button>
                  </td>
                  <td>
                    <button
                      className={`button table-action ${repo.isPublic ? "button-public" : "button-private"}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleToggleVisibility(repo);
                      }}
                    >
                      {repo.isPublic ? "Public" : "Private"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreating && <CreateRepoComponent toggle={closeCreateDialog} refreshRepos={fetchRepos} />}
      {selectedRepo && (
        <RepoDetailsComponent
          repo={selectedRepo}
          onClose={() => setSelectedRepo(null)}
          refreshRepos={fetchRepos}
        />
      )}
    </div>
  );
}

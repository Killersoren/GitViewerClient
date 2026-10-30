import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import type { Repository } from "../../types/Repository";
import axios, { HttpStatusCode } from "axios";


export default function PublicUserRepos() {
  const {userId} = useParams<{ userId: string }>();
  const { shareLinkId } = useParams<{ shareLinkId: string }>();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const openRepoInNewTab = (repoId: string) => {
    window.open(`/repo/${repoId}`, "_blank", "noopener,noreferrer");
  };

  const fetchUsernameByUserId = async (id: string) => {
    try {
      const usernameRes = await api.get(`/api/user/get-username?userId=${encodeURIComponent(id)}`);
      setUsername(usernameRes.data || "Unknown User");
    } catch {
      setUsername("Unknown User");
    }
  };

  useEffect(() => {
    const fetchRepos = async () => {
      if (!userId && !shareLinkId) {
        setErrorStatus(400);
        setLoading(false);
        return;
      }
      setLoading(true);
      setErrorStatus(null);
      setRepos([]);
      setUsername("");

      if (shareLinkId) {
        try {
          const res = await api.get(`/api/Repo/get-user-repos-from-sharelink?shareLinkId=${encodeURIComponent(shareLinkId!)}`);
          const shareRepos = res.data || [];
          setRepos(shareRepos);

          localStorage.setItem("shareLinkId", shareLinkId!);

          const userIdRes = await api.get(`/api/User/get-userid-from-Sharelink?shareLinkId=${encodeURIComponent(shareLinkId!)}`);
          const resolvedUserId = userIdRes.data || "";

          if (resolvedUserId) {
            await fetchUsernameByUserId(resolvedUserId);
          } else {
            setUsername("Unknown User");
          }

          setLoading(false);
          return;
        } catch (error: unknown) {
          setErrorStatus(axios.isAxiosError(error) ? error.response?.status ?? -1 : -1);
          setLoading(false);
          return;
        }
      }

      if (userId) {
        try {
          const userReposRes = await api.get(`/api/Repo/get-all-public-user-repos?userId=${encodeURIComponent(userId)}`);
          setRepos(userReposRes.data || []);
          await fetchUsernameByUserId(userId);
        } catch (error: unknown) {
          setErrorStatus(axios.isAxiosError(error) ? error.response?.status ?? -1 : -1);
        } finally {
          setLoading(false);
        }
        return;
      }

      setErrorStatus(400);
      setLoading(false);
    };

    void fetchRepos();
  }, [userId, shareLinkId]);

  const pageTitle = shareLinkId
    ? `Repositories shared by ${username || "…"}`
    : `${username || "…"}'s public repositories`;

  let errorMessage: string | null = null;
  if (errorStatus === HttpStatusCode.Unauthorized) {
    errorMessage = "You do not have access to view these repositories. Log in or ask the owner to grant you access.";
  } else if (errorStatus === HttpStatusCode.NotFound) {
    errorMessage = "The user or share link could not be found.";
  } else if (errorStatus === HttpStatusCode.BadRequest) {
    errorMessage = "The link is invalid. Please check that you have the complete URL.";
  } else if (errorStatus !== null) {
    errorMessage = "Could not load repositories. Please try again.";
  }

  return (
    <div className="public-repo-page">
      <header className="public-repo-heading">
        <a className="brand" href="/" aria-label="GitViewer home">
          <span className="brand-mark" aria-hidden="true">G</span>
          <span>GitViewer</span>
        </a>
        <div>
          <span className="eyebrow">{shareLinkId ? "Shared repositories" : "Public profile"}</span>
          <h1>{pageTitle}</h1>
          <p>Select a repository to view its files.</p>
        </div>
      </header>

      <main className="public-user-repos-content">
        {loading ? (
          <p className="loading-state">Loading repositories…</p>
        ) : errorMessage ? (
          <p className="error-state" role="alert">{errorMessage}</p>
        ) : repos.length === 0 ? (
          <p className="empty-state">No repositories are available to view.</p>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Source</th>
                  <th scope="col">Updated</th>
                </tr>
              </thead>
              <tbody>
                {repos.map((repo) => (
                  <tr
                    key={repo.id}
                    tabIndex={0}
                    onClick={() => openRepoInNewTab(repo.id)}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openRepoInNewTab(repo.id);
                      }
                    }}
                    aria-label={`Open ${repo.name} repository in a new tab`}
                  >
                    <td>
                      <span className="table-primary">
                        <span className="repo-mark" aria-hidden="true">↗</span>
                        {repo.name}
                      </span>
                    </td>
                    <td><span className="table-secondary" title={repo.source}>{repo.source}</span></td>
                    <td>{new Date(repo.updated).toLocaleDateString("sv-SE")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

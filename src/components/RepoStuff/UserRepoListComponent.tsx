import { useEffect, useState } from "react";
import api from "../../api/axios";
import CreateRepoComponent from "./CreateRepoComponent";
import {RepoDetailsComponent} from "./RepoDetailsComponent";
import type {Repository} from "../../types/Repository"

export default function UserRepos() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [popupType, setPopupType] = useState<'seeRepos' | 'createRepo' | null>(null);
  const [copiedRepoId, setCopiedRepoId] = useState<string | null>(null);

  function togglePop () {
    setPopupType(null)
  };
    
      const fetchRepos = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/api/Repo/get-all-user-repos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRepos(response.data);
      } catch (err: any) {
        setError(err.response?.data || "Failed to fetch repositories");
      }
    };

  useEffect(() => {
    fetchRepos();
  }, []);

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Your Repositories</h2>
      <button onClick={() => setPopupType('createRepo')}>Add repository</button>
      {popupType === 'createRepo' && <CreateRepoComponent toggle={togglePop} refreshRepos={fetchRepos}/>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead style={{ backgroundColor: "#4d0a54ff" }}>
          <tr>
            <th style={{ textAlign: "left", padding: "12px" }}>Name</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Source</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Created</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Share</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Repository status</th>
          </tr>
        </thead>
        <tbody>
          {repos.map((repo) => (
            <tr
              key={repo.id}
              onClick={()=> setSelectedRepo(repo)}
              className="repo-row"
              style={{
                cursor: "pointer",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <td style={{ padding: "12px" }}>{repo.name}</td>
              <td style={{ padding: "12px" }}>{repo.source}</td>
              <td style={{ padding: "12px" }}>{new Date(repo.created).toLocaleDateString()}</td>
              <td style={{ padding: "12px" }}>
                <button
                  onClick={async (e) => {
                    e.stopPropagation(); // prevents row click
                    const link = `/repo/${repo.id}`;
                    await navigator.clipboard.writeText(window.location.origin + link);
                    setCopiedRepoId(repo.id); // Set the copied repo id
                  }}
                >
                  {copiedRepoId === repo.id ? "Link copied" : "Share"}
                </button>
              </td>
              <td style={{ padding: "12px" }}>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const token = localStorage.getItem("token");
                      
                      const newIsPublic = !repo.isPublic;
                      await api.post(
                        `/api/Repo/toggle-public?repoId=${repo.id}&isPublic=${newIsPublic}`,
                        {},
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );
                      setRepos((prev) =>
                        prev.map((r) =>
                          r.id === repo.id ? { ...r, isPublic: newIsPublic } : r
                        )
                      );
                    } catch (err: any) {
                      alert("Failed to toggle public state");
                    }
                  }}
                >
                  {repo.isPublic ? "Public" : "Private"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

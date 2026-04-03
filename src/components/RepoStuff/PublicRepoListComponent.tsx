import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import type { Repository } from "../../types/Repository";
import SeasonalImage from "../SeasonalImage";
import { HttpStatusCode } from "axios";


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
    } catch (err: any) {
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
        } catch (err: any) {
          setErrorStatus(err.response?.status || null);
        }
      }

      if (userId) {
        try {
          const userReposRes = await api.get(`/api/Repo/get-all-public-user-repos?userId=${encodeURIComponent(userId)}`);
          setRepos(userReposRes.data || []);
          await fetchUsernameByUserId(userId);
        } catch (err: any) {
          setErrorStatus(err.response?.status || null);
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

  if (loading) return <p>Loading public repositories…</p>;

  if (errorStatus === HttpStatusCode.Unauthorized)
    return <p>You do not have access to view this user's public repositories. Either login or ask the owner to grant you access.</p>;
  if (errorStatus === HttpStatusCode.NotFound)
    return <p>User not found. The user might not exist.</p>;
  if (errorStatus === HttpStatusCode.BadRequest)
    return <p>Bad request. Please check the ID, you might not have used the complete URL.</p>;

  if (repos.length === 0) return <p>No public repositories found for this user.</p>;

  return (
    <div>
      <h1>{username}'s public repositories</h1>
      <h3 style={{textDecorationLine: "underline"}}>Click on a repository on the list to open it on a new tab</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem"  }}>
        <thead style={{ backgroundColor: "#4d0a54ff" }}>
          <tr>
            <th style={{ textAlign: "left", padding: "12px" }}>Name</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Source</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Updated</th>
          </tr>
        </thead>
        <tbody>
          {repos.map((repo) => (
            <tr
              key={repo.id}
              onClick={() => openRepoInNewTab(repo.id)}
              className="repo-row"
              style={{ cursor: "pointer", borderBottom: "1px solid #e0e0e0" }}
            >
              <td style={{ padding: "12px" }}>{repo.name}</td>
              <td style={{ padding: "12px" }}>{repo.source}</td>
              <td style={{ padding: "12px" }}>{new Date(repo.updated).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <SeasonalImage imageKey="TorbenHD" className="logo" alt="Torben logo" />
    </div>
  );
}

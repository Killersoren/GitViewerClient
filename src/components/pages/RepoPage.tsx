import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import FileTree from "../RepoStuff/GitTree";
import type { Repository } from "../../types/Repository";
import axios, { HttpStatusCode } from "axios";

const RepoPage = () => {
  const { repoId } = useParams<{ repoId: string }>();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const shareLinkId =  localStorage.getItem("shareLinkId");
        const params: { repoId: string; shareLinkId?: string } = { repoId: repoId! };
        if (shareLinkId) {
          params.shareLinkId = shareLinkId;
        }
        
        const res = await api.get(`/api/Repo/get-single-repo`, { params });
        setRepo(res.data);
        setErrorStatus(null);
      } catch (err) {
        setRepo(null);
        setErrorStatus(axios.isAxiosError(err) ? err.response?.status ?? null : null);
      }
    };

    if (repoId) fetchRepo();
  }, [repoId]);


  if (errorStatus === HttpStatusCode.Unauthorized)
    return <p className="error-state">You do not have access to this repository. Either log in or ask the owner to grant you access.</p>;
  if (errorStatus === HttpStatusCode.NotFound)
    return <p className="error-state">Repository not found. It might have been deleted.</p>;
  if (errorStatus === HttpStatusCode.BadRequest)
    return <p className="error-state">Bad request. Please check the repository ID.</p>;

  if (!repo) return <p className="loading-state">Loading repository…</p>;

  return (
    <div className="public-repo-page">
      <header className="public-repo-heading">
        <a className="brand" href="/">
          <span className="brand-mark">G</span>
          <span>GitViewer</span>
        </a>
        <div>
          <span className="eyebrow">Repository</span>
          <h1>{repo.name}</h1>
        </div>
      </header>
      <FileTree repo={repo} />
    </div>
  );
};

export default RepoPage;

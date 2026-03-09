import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import FileTree from "../RepoStuff/GitTree";
import type { Repository } from "../../types/Repository";
import type { User } from "../../types/User";
import { HttpStatusCode } from "axios";

const RepoPage = () => {
  const { repoId } = useParams<{ repoId: string }>();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const res = await api.get(`/api/Repo/get-single-repo`, {
          params: { repoId }
        });
        setRepo(res.data);
        setUser(res.data.userId);
        setErrorStatus(null);
      } catch (err: any) {
        setRepo(null);
        setUser(null);
        setErrorStatus(err.response?.status || null);
      }
    };

    if (repoId) fetchRepo();
  }, [repoId]);


  if (errorStatus === HttpStatusCode.Unauthorized)
    return <p>You do not have access to this repository. Either login or ask the owner to grant you access.</p>;
  if (errorStatus === HttpStatusCode.NotFound)
    return <p>Repository not found. It might have been deleted.</p>;
  if (errorStatus === HttpStatusCode.BadRequest)
    return <p>Bad request. Please check the repository ID.</p>;

  if (!repo) return <p>Loading repository...</p>;



  return (
    <div>
      <h1>{repo.name}</h1>
      {user ? <FileTree repo={repo} user={user} /> : <FileTree repo={repo} user={{} as User} />}
    </div>
  );
};

export default RepoPage;

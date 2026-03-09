import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Repository } from "../../types/Repository";
import type { User } from "../../types/User";
import { HttpStatusCode } from "axios";

interface TreeResponse {
  directories: string[];
  files: string[];
}

interface Props {
  repo: Repository;
  user: User;
}

const FileTree: React.FC<Props> = ({ repo }) => {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [tree, setTree] = useState<TreeResponse | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setErrorStatus(null); // Reset error before fetching
        const token = localStorage.getItem("accessToken");
        const pathParam = currentPath ? `&path=${encodeURIComponent(currentPath)}` : "";
        const res = await api.get(
          `/api/Repo/tree?repoId=${repo.id}${pathParam}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setTree(res.data);
      } catch (err: any) {
        setTree(null);
        setErrorStatus(err.response?.status || -1);
      }
    };

    fetchTree();
  }, [repo.id, currentPath]);


  const openFile = async (fileName: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;

        const res = await api.get(`/api/Repo/file?repoId=${repo.id}&path=${fullPath}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFileContent(res.data.content);
    } catch (err) {
      console.error("Failed to fetch file:", err);
    }
  };

  const enterDirectory = (dirName: string) => {
    const newPath = currentPath ? `${currentPath}/${dirName}` : dirName;
    setCurrentPath(newPath);
    setFileContent(null);
  };

  const goBack = () => {
    if (!currentPath) return;
    const parts = currentPath.split("/");
    parts.pop();
    setCurrentPath(parts.join("/"));
    setFileContent(null);
  };

  if (errorStatus === HttpStatusCode.NotFound) {
    return <p>Repository data not found, it might have been deleted.</p>;
  }
  if (errorStatus && errorStatus !== 0) {
    return <p>Error loading repository tree (status: {errorStatus})</p>;
  }

  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      <div>
        {currentPath && <button onClick={goBack}>⬅️ Back</button>}
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {tree?.directories.map((dir) => (
            <li key={dir}>
              📁 <button onClick={() => enterDirectory(dir)}>{dir}</button>
            </li>
          ))}
          {tree?.files.map((file) => (
            <li key={file}>
              📄 <button onClick={() => openFile(file)}>{file}</button>
            </li>
          ))}
        </ul>
      </div>

      {fileContent && (
        <div style={{ flex: 1 }}>
          <h3>File Viewer</h3>
          <pre style={{ background: "#000000ff", padding: "1rem", overflow: "auto", textAlign: "left" }}>
            {fileContent}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FileTree;

import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Repository } from "../../types/Repository";
import axios, { HttpStatusCode } from "axios";

interface TreeResponse {
  directories: string[];
  files: string[];
}

interface Props {
  repo: Repository;
}

const FileTree: React.FC<Props> = ({ repo }) => {
  const [currentPath, setCurrentPath] = useState("");
  const [tree, setTree] = useState<TreeResponse | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchTree() {
      setIsLoading(true);
      setErrorStatus(null);
      try {
        const res = await api.get<TreeResponse>("/api/Repo/tree", {
          params: { repoId: repo.id, ...(currentPath ? { path: currentPath } : {}) },
        });
        if (active) setTree(res.data);
      } catch (error) {
        if (!active) return;
        setTree(null);
        setErrorStatus(axios.isAxiosError(error) ? error.response?.status ?? -1 : -1);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void fetchTree();
    return () => {
      active = false;
    };
  }, [repo.id, currentPath]);

  async function openFile(fileName: string) {
    const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
    setSelectedFile(fullPath);
    setFileError(null);
    setFileContent(null);
    try {
      const res = await api.get<{ content: string }>("/api/Repo/file", {
        params: { repoId: repo.id, path: fullPath },
      });
      setFileContent(res.data.content);
    } catch (error) {
      console.error("Failed to fetch file:", error);
      setFileError("Could not load this file. Please try again.");
    }
  }

  function navigateTo(path: string) {
    setCurrentPath(path);
    setSelectedFile(null);
    setFileContent(null);
    setFileError(null);
  }

  const pathParts = currentPath ? currentPath.split("/") : [];

  if (errorStatus === HttpStatusCode.NotFound) {
    return <p className="error-state">Repository data not found. It may have been deleted.</p>;
  }
  if (errorStatus !== null) {
    return <p className="error-state">Could not load repository files (status: {errorStatus}).</p>;
  }

  return (
    <div className="repository-browser">
      <section className="file-list" aria-label="Repository files">
        <p className="file-path">
          <button className="breadcrumb-button" onClick={() => navigateTo("")}>Root</button>
          {pathParts.map((part, index) => {
            const path = pathParts.slice(0, index + 1).join("/");
            return (
              <React.Fragment key={path}>
                <span aria-hidden="true"> / </span>
                <button className="breadcrumb-button" onClick={() => navigateTo(path)}>{part}</button>
              </React.Fragment>
            );
          })}
        </p>
        {isLoading ? (
          <p className="loading-state">Loading files…</p>
        ) : (
          <>
            {currentPath && (
              <button
                className="file-row file-row-back"
                onClick={() => navigateTo(pathParts.slice(0, -1).join("/"))}
              >
                <span aria-hidden="true">←</span> Parent folder
              </button>
            )}
            {tree && tree.directories.length === 0 && tree.files.length === 0 && (
              <p className="empty-state">This folder is empty.</p>
            )}
            <ul>
              {tree?.directories.map((directory) => (
                <li key={`directory:${directory}`}>
                  <button className="file-row" onClick={() => navigateTo(currentPath ? `${currentPath}/${directory}` : directory)}>
                    <span className="file-type-icon" aria-hidden="true">D</span>{directory}
                  </button>
                </li>
              ))}
              {tree?.files.map((file) => (
                <li key={`file:${file}`}>
                  <button
                    className={`file-row${selectedFile === (currentPath ? `${currentPath}/${file}` : file) ? " is-selected" : ""}`}
                    onClick={() => void openFile(file)}
                  >
                    <span className="file-type-icon file-type-document" aria-hidden="true">F</span>{file}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="file-preview" aria-label="File preview">
        {selectedFile ? (
          <>
            <div className="file-preview-heading">
              <h3>{selectedFile}</h3>
              <button className="preview-close" onClick={() => setSelectedFile(null)} aria-label="Close preview">×</button>
            </div>
            {fileError ? (
              <p className="error-state">{fileError}</p>
            ) : fileContent === null ? (
              <p className="loading-state">Loading file…</p>
            ) : (
              <pre>{fileContent}</pre>
            )}
          </>
        ) : (
          <div className="preview-placeholder">
            <span className="preview-placeholder-icon" aria-hidden="true">F</span>
            <p>Select a file to preview its contents</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default FileTree;

import React, { useState } from "react";
import type { FormEvent } from "react";
import "../../App.css";
import { RepoDetailsComponent } from "./RepoDetailsComponent";
import type { Repository } from "../../types/Repository";
import { createAndCloneRepo } from "../../services/RepoService";

interface CreateRepoComponentProps {
  toggle?: () => void;
  refreshRepos?: () => void;
}

const CreateRepoComponent: React.FC<CreateRepoComponentProps> = (props) => {
  const [repoSource, setRepoSource] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [newRepo, setNewRepo] = useState<Repository | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function createRepo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsProcessing(true);
    setMessage(null);

    // reuse service
    const result = await createAndCloneRepo(repoSource);
    if (result.repo) {
      setNewRepo(result.repo);
      setMessage(result.message);
      if (props.refreshRepos) props.refreshRepos();
    } else {
      setMessage(result.message);
    }

    setIsProcessing(false);
  }

  return (
    <div className="popup">
      <div className="popup-inner">
        <h2>Add Repository</h2>
        <form onSubmit={createRepo}>
          <label>
            Repository URL (HTTPS & SSH supported):
            <input
              type="text"
              value={repoSource}
              onChange={(e) => setRepoSource(e.target.value)}
              disabled={isProcessing}
            />
          </label>
          <button type="submit" disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Create"}
          </button>
        </form>
        <button onClick={props.toggle} disabled={isProcessing}>
          Close
        </button>
      </div>

      {newRepo && (
        <RepoDetailsComponent
          repo={newRepo}
          onClose={() => setNewRepo(null)}
          refreshRepos={props.refreshRepos}
          message={message}
          closeParent={() => {
            props.toggle?.();
          }}
        />
      )}
    </div>
  );
};

export default CreateRepoComponent;
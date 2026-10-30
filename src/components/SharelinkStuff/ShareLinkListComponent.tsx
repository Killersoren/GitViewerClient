import type { MouseEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import CreateShareLinkComponent from "./CreateShareLinkComponent";
import { ShareLinkDetailsComponent } from "./ShareLinkDetailsComponent";
import type { ShareLink } from "../../types/ShareLink";

export default function ShareLinks() {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShareLink, setSelectedShareLink] = useState<ShareLink | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedShareLinkId, setCopiedShareLinkId] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  const fetchShareLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<ShareLink[]>("/api/ShareLink/get-sharelinks");
      setShareLinks(response.data);
    } catch (err) {
      console.error("Failed to fetch sharelinks", err);
      setError("Could not load sharelinks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchShareLinks();
  }, [fetchShareLinks]);

  async function handleShare(shareLink: ShareLink, event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setCopyError(null);
    try {
      const id = shareLink.id.replace(/-/g, "");
      await navigator.clipboard.writeText(`${window.location.origin}/s/${id}`);
      setCopiedShareLinkId(shareLink.id);
      window.setTimeout(() => setCopiedShareLinkId(null), 2000);
    } catch (copyError) {
      console.error("Failed to copy sharelink", copyError);
      setCopyError("Could not copy the sharelink. Check clipboard permissions and try again.");
    }
  }

  return (
    <div>
      <div className="list-heading">
        <button className="button button-primary" onClick={() => setIsCreating(true)}>
          Create sharelink
        </button>
      </div>

      {error && <p className="error-state" role="alert">{error}</p>}
      {copyError && <p className="error-state" role="alert">{copyError}</p>}
      {isLoading && <p className="loading-state">Loading sharelinks…</p>}
      {!isLoading && !error && shareLinks.length === 0 && (
        <p className="empty-state">No sharelinks yet. Create one when you are ready to share.</p>
      )}
      {!isLoading && !error && shareLinks.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">sharelink</th>
                <th scope="col">Created</th>
                <th scope="col">Expires</th>
                <th scope="col">Share</th>
              </tr>
            </thead>
            <tbody>
              {shareLinks.map((shareLink) => (
                  <tr
                    key={shareLink.id}
                    tabIndex={0}
                    onClick={() => setSelectedShareLink(shareLink)}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedShareLink(shareLink);
                      }
                    }}
                    aria-label={`View ${shareLink.name} sharelink details`}
                  >
                    <td>
                      <span className="table-primary">
                        <span className="repo-mark" aria-hidden="true">↗</span>
                        {shareLink.name}
                      </span>
                    </td>
                    <td>{new Date(shareLink.created).toLocaleDateString("sv-SE")}</td>
                    <td>{shareLink.expiryTime ? new Date(shareLink.expiryTime).toLocaleDateString("sv-SE") : "Never"}</td>
                    <td>
                      <button
                        className="button button-secondary table-action"
                        onClick={(event) => void handleShare(shareLink, event)}
                      >
                        {copiedShareLinkId === shareLink.id ? "Link copied" : "Share"}
                      </button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreating && (
        <CreateShareLinkComponent
          toggle={() => setIsCreating(false)}
          refreshShareLinks={fetchShareLinks}
        />
      )}
      {selectedShareLink && (
        <ShareLinkDetailsComponent
          shareLink={selectedShareLink}
          onClose={() => setSelectedShareLink(null)}
          refreshShareLinks={fetchShareLinks}
        />
      )}
    </div>
  );
}

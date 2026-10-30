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

  const fetchShareLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<ShareLink[]>("/api/ShareLink/get-sharelinks");
      setShareLinks(response.data);
    } catch (err) {
      console.error("Failed to fetch share links", err);
      setError("Could not load share links. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchShareLinks();
  }, [fetchShareLinks]);

  return (
    <div>
      <div className="list-heading">
        <button className="button button-primary" onClick={() => setIsCreating(true)}>
          Create share link
        </button>
      </div>

      {error && <p className="error-state" role="alert">{error}</p>}
      {isLoading && <p className="loading-state">Loading share links…</p>}
      {!isLoading && !error && shareLinks.length === 0 && (
        <p className="empty-state">No share links yet. Create one when you are ready to share.</p>
      )}
      {!isLoading && !error && shareLinks.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Share link</th>
                <th scope="col">Created</th>
                <th scope="col">Expires</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {shareLinks.map((shareLink) => {
                const isExpired = shareLink.expiryTime !== null && new Date(shareLink.expiryTime).getTime() < Date.now();
                return (
                  <tr
                    key={shareLink.id}
                    tabIndex={0}
                    onClick={() => setSelectedShareLink(shareLink)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedShareLink(shareLink);
                      }
                    }}
                    aria-label={`View ${shareLink.name} share link details`}
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
                      <span className={`status-badge ${isExpired ? "status-private" : "status-expiry"}`}>
                        {isExpired ? "Expired" : "Active"}
                      </span>
                    </td>
                  </tr>
                );
              })}
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

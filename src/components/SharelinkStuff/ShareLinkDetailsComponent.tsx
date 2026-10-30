import React, { useState } from "react";
import RemoveShareLinkComponent from "./RemoveShareLinkComponent";
import type { ShareLink } from "../../types/ShareLink";
import { useAuth } from "../authContext";

interface Props {
  shareLink: ShareLink;
  onClose: () => void;
  refreshShareLinks?: () => void;
  message?: string | null;
  closeParent?: () => void;
}

export const ShareLinkDetailsComponent: React.FC<Props> = ({
  shareLink,
  onClose,
  refreshShareLinks,
  message,
  closeParent,
}) => {
  const [copied, setCopied] = useState(false);
  const { isProcessing } = useAuth();

  function handleCloseAll() {
    onClose();
    closeParent?.();
  }

  async function handleCopyLink() {
    try {
      const id = shareLink.id.replace(/-/g, "");
      await navigator.clipboard.writeText(`${window.location.origin}/s/${id}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy share link", error);
    }
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !isProcessing) handleCloseAll();
  }

  return (
    <div className="popup" onMouseDown={handleBackdropClick}>
      <div className="popup-inner" role="dialog" aria-modal="true" aria-labelledby="share-link-detail-title">
        <button
          className="dialog-close"
          type="button"
          onClick={handleCloseAll}
          disabled={isProcessing}
          aria-label="Close share link details"
        >
          ×
        </button>
        <span className="eyebrow">Share link details</span>
        <h2 id="share-link-detail-title">{shareLink.name}</h2>
        <dl className="detail-grid">
          <dt>Created</dt>
          <dd>{new Date(shareLink.created).toLocaleString("sv-SE")}</dd>
          <dt>Expires</dt>
          <dd>{shareLink.expiryTime ? new Date(shareLink.expiryTime).toLocaleString("sv-SE") : "Never"}</dd>
        </dl>

        {message && <div className="alert-box" role="alert">{message}</div>}

        <div className="detail-actions">
          <button className="button button-primary" onClick={handleCopyLink}>
            {copied ? "Link copied" : "Copy share link"}
          </button>
            <RemoveShareLinkComponent
              shareLinkId={shareLink.id}
              onSuccess={() => {
                onClose();
                refreshShareLinks?.();
              }}
            />
          <button className="button button-secondary" onClick={handleCloseAll} disabled={isProcessing}>
            Done
          </button>
        </div>
        {isProcessing && <p className="loading-state">Working…</p>}
      </div>
    </div>
  );
};

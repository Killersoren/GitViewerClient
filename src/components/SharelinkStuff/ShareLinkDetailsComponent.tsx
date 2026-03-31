import React from "react";
import RemoveShareLinkComponent from "./RemoveShareLinkComponent";
import type { ShareLink } from "../../types/ShareLink";
import { useAuth } from "../authContext";

// Shows additional information and actions for a selected repository
interface Props {
  shareLink: ShareLink;
  onClose: () => void;
  refreshShareLinks?: () => void;
  message?: string | null;
  closeParent?: () => void;
}

export const ShareLinkDetailsComponent: React.FC<Props> = ({ shareLink: shareLink, onClose, refreshShareLinks: refreshShareLinks, message, closeParent }) => {
  const { isProcessing } = useAuth();

  const handleCloseAll = () => {
    onClose();
    if (closeParent) closeParent();
  };

  return (
    <div className="popup">
      <div className="popup-inner">
        <h2>{shareLink.name}</h2>
        <p><strong>Name:</strong> {shareLink.name}</p>
        <p><strong>Created:</strong> {new Date(shareLink.created).toLocaleString()}</p>
        <p><strong>Expiry date:</strong> {shareLink.expiryTime ? new Date(shareLink.expiryTime).toLocaleString() : "Never"}</p>


        {message && (
          <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid red", backgroundColor: "#360000ff" }}>
            <strong>Attention:</strong>
            <p>{message}</p>
          </div>
        )}

        <RemoveShareLinkComponent
          shareLinkId={shareLink.id}
          onSuccess={() => {
            onClose();
            setTimeout(() => {
              if (refreshShareLinks) refreshShareLinks();
            }, 100);
          }}
        />


        <button onClick={handleCloseAll} disabled={isProcessing}>Close</button>
        {isProcessing && <div>Processing...</div>}
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import api from "../../api/axios";
import CreateShareLinkComponent from "./CreateShareLinkComponent";
import { ShareLinkDetailsComponent } from "./ShareLinkDetailsComponent";
import type { ShareLink } from "../../types/ShareLink";

export default function ShareLinks() {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedShareLink, setSelectedShareLink] = useState<ShareLink | null>(null);
  const [popupType, setPopupType] = useState<'seeShareLinks' | 'createShareLink' | null>(null);
  const [copiedShareLinkId, setCopiedShareLinkId] = useState<string | null>(null);

  function togglePop () {
    setPopupType(null)
  };
    
      const fetchShareLinks = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/api/ShareLink/get-sharelinks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setShareLinks(response.data);
      } catch (err: any) {
        setError(err.response?.data || "Failed to fetch sharelinks");
      }
    };

  useEffect(() => {
    fetchShareLinks();
  }, []);

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Sharelinks</h2>
      <button onClick={() => setPopupType('createShareLink')}>Create new sharelink</button>
      {popupType === 'createShareLink' && <CreateShareLinkComponent toggle={togglePop} refreshShareLinks={fetchShareLinks}/>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead style={{ backgroundColor: "#4d0a54ff" }}>
          <tr>
            <th style={{ textAlign: "left", padding: "12px" }}>Name</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Created</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Expiry Date</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Share</th>
          </tr>
        </thead>
        <tbody>
          {shareLinks.map((shareLink) => (
            <tr
              key={shareLink.id}
              onClick={()=> setSelectedShareLink(shareLink)}
              className="repo-row"
              style={{
                cursor: "pointer",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <td style={{ padding: "12px" }}>{shareLink.name}</td>
              <td style={{ padding: "12px" }}>{new Date(shareLink.created).toLocaleDateString()}</td>
              <td style={{ padding: "12px" }}>{shareLink.expiryTime ? new Date(shareLink.expiryTime).toLocaleDateString() : "Never"}</td>
              <td style={{ padding: "12px" }}>
                <button
                  onClick={async (e) => {
                    e.stopPropagation(); // prevents row click
                    const shareLinkIdWithoutDashes = shareLink.id.replace(/-/g, '');
                    const sharelink = `${window.location.origin}/s/${shareLinkIdWithoutDashes}`;
                    await navigator.clipboard.writeText(sharelink);
                    setCopiedShareLinkId(shareLink.id);
                  }}
                >
                  {copiedShareLinkId === shareLink.id ? "Link copied" : "Share"}
                </button>
              </td>
              <td style={{ padding: "12px" }}>
                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

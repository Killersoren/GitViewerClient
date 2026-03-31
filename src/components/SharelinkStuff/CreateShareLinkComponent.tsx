import React, { useState } from "react";
import type { FormEvent } from "react";
import "../../App.css";
import api from "../../api/axios";
import axios from "axios";

interface CreateShareLinkComponentProps {
  toggle?: () => void;
  refreshShareLinks?: () => void;
}

const CreateShareLinkComponent: React.FC<CreateShareLinkComponentProps> = (props) => {
  const [shareLinkName, setShareLinkName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [expiryTimeInDays, setExpiryTimeInDays] = useState<number | undefined>(undefined);

  async function createShareLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!shareLinkName.trim()) {
      setMessage("Sharelink name is required.");
      return;
    }
    setIsProcessing(true);
    setMessage(null);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setMessage("No access token found. Please log in.");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    let url = "/api/ShareLink/create-sharelink?name=" + encodeURIComponent(shareLinkName);
    if (expiryTimeInDays !== undefined) {
      url += "&expiryTimeInDays=" + expiryTimeInDays;
    }

    try {
      const response = await api.post(url, {}, { headers });
      setMessage(response.data);
      props.refreshShareLinks?.();
    } catch (error: any) {
      const errMsg = axios.isAxiosError(error) ? (error.response?.data?.message || error.message) : String(error);
      setMessage(`Failed to create sharelink: ${errMsg}`);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="popup">
      <div className="popup-inner">
        <h2>Create sharelink</h2>
        <form onSubmit={createShareLink}>
          <label>
            Sharelink name:
            <input
              type="text"
              value={shareLinkName}
              onChange={(e) => setShareLinkName(e.target.value)}
              disabled={isProcessing}
            />
          </label>

          <label>
            Expiry date in days (WIP):
            <input
              type="number"
              min="1"
              value={expiryTimeInDays || ''}
              onChange={(e) => setExpiryTimeInDays(e.target.value ? parseInt(e.target.value) : undefined)}
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
        {message && <p>{message}</p>}
      </div>
    
    </div>
  );
};

export default CreateShareLinkComponent;
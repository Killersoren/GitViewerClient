import api from "../api/axios";
import axios from "axios";

export type CreateAndCloneResult = {
  repo: any | null;
  message: string | null;
  status: "OK" | "CloneFailed" | "CreateFailed";
};

export async function createAndCloneRepo(source: string): Promise<CreateAndCloneResult> {
  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const createResp = await api.post("/api/Repo/add-repo", { source }, { headers });
    const repo = createResp.data;

    try {
      await api.post(`/api/Repo/clone-repo?repoId=${repo.id}`, {}, { headers });
      // success
      return { repo, message: "Repository created and cloned successfully!", status: "OK" };
    } catch (cloneErr: any) {
      const errMsg = axios.isAxiosError(cloneErr) ? (cloneErr.response?.data?.message || cloneErr.message) : String(cloneErr);

      if (source.startsWith("http://") || source.startsWith("https://")) {
        const message = `Cloning failed. The repository might be private or the URL is incorrect. Try using an SSH URL.\n\nError: ${errMsg}`;
    
        return { repo, message, status: "CloneFailed" };
      }

      if (source.startsWith("git@") || source.startsWith("ssh://")) {
        // generate deploy key
        try {
          const genResp = await api.post(`/api/Repo/generate-deploy-key?repoId=${repo.id}`, {}, { headers });
          const publicKey = genResp.data?.publicKey ?? genResp.data?.publickey ?? null;
          if (publicKey) {
            sessionStorage.setItem(`deployKey:${repo.id}`, publicKey);
            const message = `Cloning failed. A deploy key has been generated. Add this key to the remote repository:\n\n${publicKey}`;
            
            return { repo, message, status: "CloneFailed" };
          } else {
            const message = `Cloning failed and deploy key generation returned no key.\n\nError: ${errMsg}`;
            
            return { repo, message, status: "CloneFailed" };
          }
        } catch (genErr: any) {
          const message = `Cloning failed and deploy key generation failed.\n\nError: ${axios.isAxiosError(genErr) ? (genErr.response?.data?.message || genErr.message) : String(genErr)}`;
          
          return { repo, message, status: "CloneFailed" };
        }
      }

      // fallback
      const message = `Cloning failed: ${errMsg}`;
      return { repo, message, status: "CloneFailed" };
    }
  } catch (createErr: any) {
    const message = axios.isAxiosError(createErr) ? (createErr.response?.data || createErr.message) : String(createErr);
    return { repo: null, message: `Repository creation failed: ${message}`, status: "CreateFailed" };
  }
}
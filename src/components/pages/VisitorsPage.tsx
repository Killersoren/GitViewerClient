import { useEffect, useState } from "react";
import { loggingApi } from "../../api/axios";

const VisitorsPage = () => {
  const [logs, setLogs] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

      const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await loggingApi.get("/api/Logging/get-repo-visitor-logs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLogs(response.data);
      } catch (err: any) {
        setError(err.response?.data || "Failed to fetch repositories");
      }
    };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (logs === null) return <p>Loading logs...</p>;
  if (logs.length === 0) return <p>No visitor logs found.</p>;

if (error) return <p>Error: {error}</p>;

return (
  <div>
    <h2>Visitor Logs</h2>

    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
      <thead style={{ backgroundColor: "#4d0a54ff" }}>
        <tr>
          <th style={{ textAlign: "center", padding: "12px" }}>Repository</th>
          <th style={{ textAlign: "center", padding: "12px" }}>Time</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => {
          const date = new Date(log.timeStamp);
          const formattedDate = date.toISOString().split("T")[0];
          const formattedTime = date.toISOString().split("T")[1].split("Z")[0].split(".")[0];

          return (
            <tr key={log.id}>
              <td style={{ textAlign: "center", padding: "12px" }}>{log.entityName}</td>
              <td style={{ textAlign: "center", padding: "12px" }}>
                {formattedDate}
                <br />
                {formattedTime} UTC
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
};

export default VisitorsPage;

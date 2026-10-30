import { useEffect, useState } from "react";
import { loggingApi } from "../../api/axios";

interface VisitorLog {
  id: string;
  entityName: string;
  timeStamp: string;
}

const VisitorsPage = () => {
  const [logs, setLogs] = useState<VisitorLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchLogs() {
      try {
        const response = await loggingApi.get<VisitorLog[]>("/api/Logging/get-repo-visitor-logs");
        if (active) setLogs(response.data);
      } catch (requestError) {
        console.error("Failed to fetch visitor logs", requestError);
        if (active) {
          setError("Could not load visitor logs. Please try again.");
          setLogs([]);
        }
      }
    }

    void fetchLogs();
    return () => {
      active = false;
    };
  }, []);

  if (error) return <p className="error-state" role="alert">{error}</p>;
  if (logs === null) return <p className="loading-state">Loading visitor logs…</p>;
  if (logs.length === 0) return <p className="empty-state">No visitor activity yet.</p>;

  return (
    <div>
      <div className="list-heading">
        <span className="status-badge">{logs.length} {logs.length === 1 ? "visit" : "visits"}</span>
      </div>
      <div className="data-table-wrap">
        <table className="data-table visitor-table">
          <thead>
            <tr>
              <th scope="col">Repository</th>
              <th scope="col">Time and date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {

              const date = new Date(log.timeStamp);
              return (
              <tr key={log.id}>
                <td>
                  <span className="table-primary">
                    {log.entityName}
                  </span>
                </td>         
                <td>
                  {date.toLocaleDateString("sv-SE")}
                  <br />
                  {date.toLocaleTimeString("sv-SE", { hour12: false })}
               </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VisitorsPage;

import "../../App.css";
import { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../authContext";
import UserRepos from "../RepoStuff/UserRepoListComponent";
import ShareLinks from "../SharelinkStuff/ShareLinkListComponent";
import VisitorsPage from "./VisitorsPage";

type DashboardSection = "repositories" | "sharelinks" | "visits";

const sections: { id: DashboardSection; label: string; description: string }[] = [
  { id: "repositories", label: "Repositories", description: "Browse and manage your repositories." },
  { id: "sharelinks", label: "Sharelinks", description: "Create and manage sharelinks for different purposes. Ex different companies or people." },
  { id: "visits", label: "Visits", description: "See recent visits to your shared repositories." },
];

const MainPage: React.FC = () => {
  const { auth, setAuth } = useAuth();
  const [activeSection, setActiveSection] = useState<DashboardSection>("repositories");
  const [copiedProfileLink, setCopiedProfileLink] = useState(false);

  async function handleLogout() {
    try {
      await api.post("/api/Auth/logout");
      localStorage.removeItem("accessToken");
      setAuth({ isLoggedIn: false });
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  async function handleCopyPublicLink() {
    if (!auth.userId) return;

    try {
      const publicLink = `${window.location.origin}/user/${auth.userId.replace(/-/g, "")}`;
      await navigator.clipboard.writeText(publicLink);
      setCopiedProfileLink(true);
      window.setTimeout(() => setCopiedProfileLink(false), 2000);
    } catch (error) {
      console.error("Failed to copy public profile link", error);
    }
  }

  if (auth.role === "Unverified") {
    return (
      <main className="verification-page">
        <section className="verification-card">
          <span className="eyebrow">GitViewer</span>
          <h1>Account not verified</h1>
          <p>This demo account is not verified yet. Only approved accounts can access all features.</p>
          <button className="button button-secondary" onClick={handleLogout}>Log out</button>
        </section>
      </main>
    );
  }

  const active = sections.find((section) => section.id === activeSection)!;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="GitViewer home">
          <span className="brand-mark">G</span>
          <span>GitViewer</span>
        </a>
        <div className="topbar-user">
          <div className="user-summary">
            <span className="avatar" aria-hidden="true">{auth.username?.charAt(0).toUpperCase() ?? "U"}</span>
            <span>{auth.username}</span>
            {auth.role === "Admin" && <span className="role-badge">Admin</span>}
          </div>
          <button className="button button-quiet" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <div className="dashboard-layout">
        <nav className="sidebar" aria-label="Main navigation">
          <div className="section-nav">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`nav-item${activeSection === section.id ? " is-active" : ""}`}
                onClick={() => setActiveSection(section.id)}
                aria-current={activeSection === section.id ? "page" : undefined}
              >
                <span className={`nav-icon nav-icon-${section.id}`} aria-hidden="true" />
                {section.label}
              </button>
            ))}
          </div>
        </nav>

        <main className="main-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow"></span>
              <h1>{active.label}</h1>
              <p>{active.description}</p>
            </div>
            <button className="button button-secondary profile-link-button" onClick={handleCopyPublicLink}>
              {copiedProfileLink ? "Profile link copied" : "Copy profile link"}
            </button>
          </div>
          <section className="content-card" aria-label={active.label}>
            {activeSection === "repositories" && <UserRepos />}
            {activeSection === "sharelinks" && <ShareLinks />}
            {activeSection === "visits" && <VisitorsPage />}
          </section>
        </main>
      </div>
    </div>
  );
};

export default MainPage;

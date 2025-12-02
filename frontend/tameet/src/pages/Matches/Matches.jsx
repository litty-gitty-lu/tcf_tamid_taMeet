import React, { useState, useEffect } from "react";
import "./Matches.css";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../utils/api";

export default function Matches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);

  // Load matches from backend
  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    const matchesData = await apiGet('/matches/current');
    setMatches(matchesData);
  };

  const handleOpenSlack = (matchId) => {
    const slackUrl = "https://tamidgroup.slack.com";
    window.open(slackUrl, "_blank");
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  const handleFindNewMatch = () => {
    navigate("/find-match");
  };

  const handleGoToSearch = () => {
    navigate("/search");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'User';

  return (
    <div className="matches-page">
      <aside className="sidebar">
        <h2>TaMeet</h2>
        <ul>
          <li onClick={handleGoToDashboard} className="clickable">Dashboard</li>
          <li className="active">Matches</li>
          <li onClick={handleGoToSearch} className="clickable">Search</li>
          <li onClick={handleGoToProfile} className="clickable">Profile</li>
          <li onClick={handleLogout} className="clickable" style={{ color: '#ef4444', marginTop: '20px' }}>Logout</li>
        </ul>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <img
              src="https://tamidgroup.org/resourcelibrary/wp-content/uploads/sites/57/2023/08/Horizontal-Group-Logo.png"
              alt="tamidLogo"
              className="brand"
            />
          </div>

          <h1 className="topbar-title">Your Matches</h1>

          <div className="topbar-right">
            <span className="greeting">Hi, {userName}!</span>
            <button className="icon-btn" aria-label="Notifications">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3602/3602145.png"
                alt="Notification bell"
                width="20"
                height="20"
              />
            </button>
            <img
              src={user.profile_picture || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"}
              alt="Profile"
              className="avatar"
            />
          </div>
        </header>

        <div className="matches-content">
          <div className="matches-header">
            <h2>Active Matches ({matches.length})</h2>
            <button className="btn-find-new" onClick={handleFindNewMatch}>
              Find New Match
            </button>
          </div>

          {matches.length > 0 ? (
            <div className="matches-list">
              {matches.map((match) => (
                <div key={match.match_id || match.id} className="match-item">
                  <div className="match-item-avatar">
                    <img
                      src={match.profile_picture || "/imgs/default.jpeg"}
                      alt={match.name}
                      className="match-avatar"
                    />
                  </div>

                  <div className="match-item-content">
                    <div className="match-item-header">
                      <h3 className="match-item-name">{match.name}</h3>
                      <span className="match-item-time">
                        Matched {new Date(match.match_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="match-item-bio">{match.bio}</p>
                    <button
                      className="btn-slack-message"
                      onClick={() => handleOpenSlack(match.match_id)}
                    >
                      Message on Slack
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-matches">
              <h3>No matches yet</h3>
              <p>Start finding matches to begin chatting!</p>
              <button className="btn-find-new" onClick={handleFindNewMatch}>
                Find Your First Match
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

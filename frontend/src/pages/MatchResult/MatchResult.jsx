import React, { useState, useEffect } from "react";
import "./MatchResult.css";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../utils/api";

export default function MatchResult() {
  const navigate = useNavigate();
  const [matchedPerson, setMatchedPerson] = useState(null);

  // Load match data from sessionStorage (set by FindMatch page)
  useEffect(() => {
    const matchData = sessionStorage.getItem('currentMatch');
    if (matchData) {
      setMatchedPerson(JSON.parse(matchData));
    } else {
      // If no match data, go back to find match
      navigate("/find-match");
    }
  }, [navigate]);

  const handleAccept = async () => {
    if (matchedPerson) {
      // Call backend to accept match
      await apiPost('/matches/accept', {
        user_id: matchedPerson.id,
        match_score: matchedPerson.match_score || 0
      });
      // Clear sessionStorage
      sessionStorage.removeItem('currentMatch');
      navigate("/matches");
    }
  };

  const handleDecline = async () => {
    if (matchedPerson) {
      // Call backend to decline match
      await apiPost('/matches/decline', {
        user_id: matchedPerson.id
      });
      // Clear sessionStorage
      sessionStorage.removeItem('currentMatch');
      navigate("/find-match");
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  const handleGoToMatches = () => {
    navigate("/matches");
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

  if (!matchedPerson) {
    return <div>Loading...</div>;
  }

  return (
    <div className="match-result-page">
      <aside className="sidebar">
        <h2>TaMeet</h2>
        <ul>
          <li onClick={handleGoToDashboard} className="clickable">Dashboard</li>
          <li onClick={handleGoToMatches} className="clickable">Matches</li>
          <li className="active">Match Result</li>
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

          <h1 className="topbar-title">Your Match</h1>

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

        <div className="match-result-content">
          <div className="match-result-card">
            <div className="match-score-badge">
              <span className="match-score-label">Match Score</span>
              <span className="match-score-value">{matchedPerson.match_score || 0}%</span>
            </div>

            <div className="match-profile-picture">
              <img
                src={matchedPerson.profile_picture || "/imgs/default.jpeg"}
                alt={matchedPerson.name}
                className="profile-image"
              />
            </div>

            <div className="match-header">
              <h2 className="match-name">{matchedPerson.name}</h2>
              <p className="match-email">{matchedPerson.email}</p>
            </div>

            <div className="match-section">
              <h3 className="section-title">About</h3>
              <p className="section-text">{matchedPerson.bio || "No bio available."}</p>
            </div>

            <div className="match-section">
              <h3 className="section-title">Interests</h3>
              <div className="match-tags">
                {matchedPerson.interests && matchedPerson.interests.length > 0 ? (
                  matchedPerson.interests.map((interest, idx) => (
                    <span key={idx} className="match-tag">
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="match-tag">No interests listed</span>
                )}
              </div>
            </div>

            <div className="match-actions">
              <button className="btn-decline" onClick={handleDecline}>
                Decline
              </button>
              <button className="btn-accept" onClick={handleAccept}>
                Accept & Chat
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

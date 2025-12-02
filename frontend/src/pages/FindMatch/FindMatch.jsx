import React, { useState } from "react";
import "./FindMatch.css";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../utils/api";

export default function FindMatch() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleFindMatch = async () => {
    setIsLoading(true);
    try {
      // Call backend to find a match
      const matchData = await apiPost('/matches/find', {});
      // Store match data in sessionStorage to pass to MatchResult page
      sessionStorage.setItem('currentMatch', JSON.stringify(matchData));
      setIsLoading(false);
      navigate("/match-result");
    } catch (error) {
      setIsLoading(false);
      console.error('Error finding match:', error);
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

  return (
    <div className="find-match-page">
      <aside className="sidebar">
        <h2>TaMeet</h2>
        <ul>
          <li onClick={handleGoToDashboard} className="clickable">Dashboard</li>
          <li onClick={handleGoToMatches} className="clickable">Matches</li>
          <li className="active">Find Match</li>
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

          <h1 className="topbar-title">Find Your Match</h1>

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

        <div className="find-match-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <h2>Finding your match...</h2>
              <p>We're searching for the perfect match for you!</p>
            </div>
          ) : (
            <div className="find-match-card">
              <h2>Ready to Find Your Match?</h2>
              <p>Click the button below to discover people who share your interests!</p>
              <button className="btn-find-match" onClick={handleFindMatch}>
                Find Match
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

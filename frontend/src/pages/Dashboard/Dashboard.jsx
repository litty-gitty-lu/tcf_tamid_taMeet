import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../utils/api";

/**
 * Dashboard component - Main landing page after user logs in
 * Displays user's current matches and provides navigation to find new matches
 */
export default function Dashboard() {
  const navigate = useNavigate();

  // State for matches from backend
  const [currentMatches, setCurrentMatches] = useState([]);
  const [pastMatches, setPastMatches] = useState([]);
  
  // Track which match's notes are being edited
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesText, setNotesText] = useState("");

  // Load matches from backend when component mounts
  useEffect(() => {
    loadMatches();
  }, []);

  // Load current and past matches from backend
  const loadMatches = async () => {
    const current = await apiGet('/matches/current');
    const past = await apiGet('/matches/past');
    setCurrentMatches(current);
    setPastMatches(past);
  };

  // Navigate to user profile page
  const handleGoToProfile = () => {
    navigate("/profile");
  };

  // Navigate to find match page
  const handleGoToMatch = () => {
    navigate("/find-match");
  };

  // Navigate to matches list page
  const handleGoToMatches = () => {
    navigate("/matches");
  };

  // Navigate to search page
  const handleGoToSearch = () => {
    navigate("/search");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Handle scheduling a coffee chat with a match - redirects to Slack
  const handleScheduleChat = (matchId) => {
    const slackUrl = "https://tamidgroup.slack.com";
    window.open(slackUrl, "_blank");
  };

  // Handle opening notes editor for a match
  const handleEditNotes = async (matchId, currentNotes) => {
    setEditingNotes(matchId);
    // Load notes from backend
    const notesData = await apiGet(`/notes/match/${matchId}`);
    setNotesText(notesData.note || "");
  };

  // Save notes for a match
  const handleSaveNotes = async (matchId) => {
    await apiPost(`/notes/match/${matchId}`, {
      note: notesText
    });
    setEditingNotes(null);
    setNotesText("");
    // Reload matches to get updated data
    loadMatches();
  };

  // Cancel editing notes
  const handleCancelNotes = () => {
    setEditingNotes(null);
    setNotesText("");
  };

  // Handle moving a match to past matches (archiving)
  const handleArchiveMatch = async (matchId, keepActive) => {
    if (!keepActive) {
      await apiPost('/matches/archive', {
        match_id: matchId
      });
      // Reload matches
      loadMatches();
    }
  };

  // Get user name from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'User';

  // URL for TAMID logo
  const tamidUrl =
    "https://tamidgroup.org/resourcelibrary/wp-content/uploads/sites/57/2023/08/Horizontal-Group-Logo.png";

  return (
    <div className="dashboard">
      {/* Sidebar navigation menu */}
      <aside className="sidebar">
        <h2>TaMeet</h2>
        <ul>
          <li className="active">Dashboard</li>
          <li onClick={handleGoToMatches} className="clickable">Matches</li>
          <li onClick={handleGoToSearch} className="clickable">Search</li>
          <li onClick={handleGoToProfile} className="clickable">Profile</li>
          <li onClick={handleLogout} className="clickable" style={{ color: '#ef4444', marginTop: '20px' }}>Logout</li>
        </ul>
      </aside>

      {/* Main content area */}
      <main className="main">
        {/* Top navigation bar */}
        <header className="topbar">
          <div className="topbar-left">
            <img src={tamidUrl} alt="tamidLogo" className="brand" />
          </div>

          <h1 className="topbar-title">Dashboard</h1>

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
            <img src={user.profile_picture || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"} alt="Profile" className="avatar" />
          </div>
        </header>

        {/* Matches section */}
        <section className="matches-section">
          <h2 className="section-title">Your Current Matches ({currentMatches.length})</h2>
          <div className="matches-list">
            {currentMatches.length > 0 ? (
              currentMatches.map((match) => (
                <div key={match.match_id || match.id} className="match-card">
                  <div className="match-card-header">
                    <img
                      src={match.profile_picture || "/imgs/default.jpeg"}
                      alt={match.name}
                      className="match-avatar"
                    />
                    <div className="match-info">
                      <h3 className="match-name">{match.name}</h3>
                      <p className="match-email">{match.email}</p>
                      <p className="match-bio">{match.bio}</p>
                    </div>
                  </div>
                  
                  {/* Match Notes Section */}
                  <div className="match-notes-section">
                    <div className="notes-header">
                      <h4 className="notes-title">Notes</h4>
                      {editingNotes !== match.match_id && (
                        <button
                          className="btn-edit-notes"
                          onClick={() => handleEditNotes(match.match_id, match.notes)}
                        >
                          {match.notes ? "Edit Notes" : "Add Notes"}
                        </button>
                      )}
                    </div>
                    {editingNotes === match.match_id ? (
                      <div className="notes-editor">
                        <textarea
                          className="notes-textarea"
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          placeholder="Add notes about this match..."
                          rows="4"
                        />
                        <div className="notes-actions">
                          <button
                            className="btn-save-notes"
                            onClick={() => handleSaveNotes(match.match_id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn-cancel-notes"
                            onClick={handleCancelNotes}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="notes-display">
                        {match.notes || "No notes yet."}
                      </p>
                    )}
                  </div>

                  <div className="match-card-actions">
                    <button
                      className="btn-schedule"
                      onClick={() => handleScheduleChat(match.match_id)}
                    >
                      Have you scheduled your coffee chat?
                    </button>
                    <div className="archive-actions">
                      <span className="archive-question">Move to past matches?</span>
                      <button
                        className="btn-archive-yes"
                        onClick={() => handleArchiveMatch(match.match_id, false)}
                      >
                        Yes
                      </button>
                      <button
                        className="btn-archive-no"
                        onClick={() => handleArchiveMatch(match.match_id, true)}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-matches-message">You have no current matches. Find someone new!</p>
            )}
          </div>
        </section>

        {/* Past Matches section */}
        {pastMatches.length > 0 && (
          <section className="matches-section">
            <h2 className="section-title">Past Matches ({pastMatches.length})</h2>
            <div className="matches-list">
              {pastMatches.map((match) => (
                <div key={match.match_id || match.id} className="match-card past-match">
                  <div className="match-card-header">
                    <img
                      src={match.profile_picture || "/imgs/default.jpeg"}
                      alt={match.name}
                      className="match-avatar"
                    />
                    <div className="match-info">
                      <h3 className="match-name">{match.name}</h3>
                      <p className="match-email">{match.email}</p>
                      <p className="match-bio">{match.bio}</p>
                    </div>
                  </div>
                  <div className="match-card-actions">
                    <span className="archived-status">Archived on: {new Date(match.archived_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Find Match button */}
        <section className="dashboard-actions">
          <button className="btn-find-match-large" onClick={handleGoToMatch}>
            Find Your Match
          </button>
        </section>
      </main>
    </div>
  );
}

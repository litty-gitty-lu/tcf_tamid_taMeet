import React, { useState, useEffect } from "react";
import "./UserProfile.css";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost } from "../../utils/api";

/**
 * UserProfile component - View another user's public profile
 * Allows following/unfollowing and viewing their information
 */
export default function UserProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);

  // Fetch user profile data from backend
  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    const userData = await apiGet(`/search/user/${userId}`);
    setProfileData(userData);
  };

  // Handle follow/unfollow toggle
  const handleFollowToggle = async () => {
    if (profileData.is_following) {
      await apiPost('/search/unfollow', { user_id: parseInt(userId) });
    } else {
      await apiPost('/search/follow', { user_id: parseInt(userId) });
    }
    // Reload profile to update follow status
    loadUserProfile();
  };

  // Handle opening Slack
  const handleOpenSlack = () => {
    const slackUrl = "https://tamidgroup.slack.com";
    window.open(slackUrl, "_blank");
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToMatches = () => {
    navigate("/matches");
  };

  const handleGoToSearch = () => {
    navigate("/search");
  };

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'User';

  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-profile-page">
      <aside className="sidebar">
        <h2>TaMeet</h2>
        <ul>
          <li onClick={handleGoToDashboard} className="clickable">Dashboard</li>
          <li onClick={handleGoToMatches} className="clickable">Matches</li>
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

          <h1 className="topbar-title">User Profile</h1>

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

        <div className="user-profile-content">
          <div className="user-profile-card">
            <div className="profile-header">
              <img
                src={profileData.profile_picture || "/imgs/default.jpeg"}
                alt={profileData.name}
                className="profile-picture-large"
              />
              <div className="profile-header-info">
                <h1 className="profile-name">{profileData.name}</h1>
                <p className="profile-email">{profileData.email}</p>
                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-number">{profileData.followers || 0}</span>
                    <span className="stat-label">Followers</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{profileData.following || 0}</span>
                    <span className="stat-label">Following</span>
                  </div>
                </div>
              </div>
              <div className="profile-actions">
                <button
                  className={`btn-follow ${profileData.is_following ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                >
                  {profileData.is_following ? 'Unfollow' : 'Follow'}
                </button>
                <button className="btn-message-slack" onClick={handleOpenSlack}>
                  Message on Slack
                </button>
              </div>
            </div>

            <div className="profile-body">
              <div className="profile-section">
                <h2 className="section-title">About</h2>
                <p className="section-text">{profileData.bio || "No bio available."}</p>
              </div>

              <div className="profile-section">
                <h2 className="section-title">Interests</h2>
                <div className="tags-container">
                  {profileData.interests && profileData.interests.length > 0 ? (
                    profileData.interests.map((interest, index) => (
                      <div key={index} className="tag">
                        {interest}
                      </div>
                    ))
                  ) : (
                    <p>No interests listed</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

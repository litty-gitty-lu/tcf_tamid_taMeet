import React, { useState, useEffect } from "react";
import "./Search.css";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../utils/api";

/**
 * Search component - Allows users to search for and follow other users
 * Displays search results with follow/unfollow functionality
 */
export default function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);

  // Load users from backend
  useEffect(() => {
    loadUsers();
  }, [searchQuery]);

  const loadUsers = async () => {
    const usersData = await apiGet(`/search/users?q=${encodeURIComponent(searchQuery)}`);
    setUsers(usersData);
  };

  // Handle follow/unfollow action
  const handleFollowToggle = async (userId, isFollowing) => {
    if (isFollowing) {
      await apiPost('/search/unfollow', { user_id: userId });
    } else {
      await apiPost('/search/follow', { user_id: userId });
    }
    // Reload users to update follow status
    loadUsers();
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToMatches = () => {
    navigate("/matches");
  };

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  const handleViewProfile = (userId) => {
    navigate(`/user/${userId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'User';

  return (
    <div className="search-page">
      <aside className="sidebar">
        <h2>TaMeet</h2>
        <ul>
          <li onClick={handleGoToDashboard} className="clickable">Dashboard</li>
          <li onClick={handleGoToMatches} className="clickable">Matches</li>
          <li className="active">Search</li>
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

          <h1 className="topbar-title">Search Users</h1>

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

        <div className="search-content">
          <div className="search-header">
            <h2>Find People</h2>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, email, or interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="users-grid">
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-card-header">
                    <img
                      src={user.profile_picture || "/imgs/default.jpeg"}
                      alt={user.name}
                      className="user-avatar"
                    />
                    <div className="user-info">
                      <h3 className="user-name">{user.name}</h3>
                      <p className="user-email">{user.email}</p>
                    </div>
                  </div>
                  <p className="user-bio">{user.bio || "No bio available."}</p>
                  <div className="user-stats">
                    <span>{user.followers || 0} Followers</span>
                    <span>{user.following || 0} Following</span>
                  </div>
                  <div className="user-actions">
                    <button
                      className={`btn-follow ${user.is_following ? 'following' : ''}`}
                      onClick={() => handleFollowToggle(user.id, user.is_following)}
                    >
                      {user.is_following ? 'Unfollow' : 'Follow'}
                    </button>
                    <button
                      className="btn-view-profile"
                      onClick={() => handleViewProfile(user.id)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-users">
                <p>No users found. Try a different search query.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

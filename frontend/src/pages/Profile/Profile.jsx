import React, { useState, useEffect } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPut } from "../../utils/api";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Samantha",
    email: "samantha@northeastern.edu",
    bio: "Product manager passionate about building innovative tech solutions at the intersection of business and technology. Love connecting with entrepreneurs, developers, and designers to create impactful products. Always excited to discuss startups, product strategy, and career growth!",
    interests: ["Product Management", "Startups", "Tech", "Business Strategy", "Innovation"],
    goals: ["Building meaningful connections", "Learning from diverse perspectives", "Career mentorship", "Collaborating on projects"],
    activityPreferences: ["Coffee", "Lunch", "Virtual"],
    slackSynced: false,
    profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    following: 12,
    followers: 8,
  });

  const [formData, setFormData] = useState({ ...profileData });
  const [newInterest, setNewInterest] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newActivity, setNewActivity] = useState("");

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const data = await apiGet('/profile');
      // Ensure all required fields exist with defaults
      setProfileData({
        ...profileData,
        ...data,
        interests: data.interests || [],
        goals: data.goals || ["Building meaningful connections", "Learning from diverse perspectives"],
        activityPreferences: data.activityPreferences || ["Coffee", "Lunch", "Virtual"],
        following: data.following || 0,
        followers: data.followers || 0,
        slackSynced: data.slackSynced || false,
      });
      setFormData({
        ...profileData,
        ...data,
        interests: data.interests || [],
        goals: data.goals || ["Building meaningful connections", "Learning from diverse perspectives"],
        activityPreferences: data.activityPreferences || ["Coffee", "Lunch", "Virtual"],
        following: data.following || 0,
        followers: data.followers || 0,
        slackSynced: data.slackSynced || false,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Keep default hardcoded data if API fails
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addItem = (type, value, setter) => {
    if (value.trim()) {
      setFormData({
        ...formData,
        [type]: [...formData[type], value.trim()],
      });
      setter("");
    }
  };

  const removeItem = (type, index) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    const updatedData = await apiPut('/profile', {
      name: formData.name,
      bio: formData.bio,
      profile_picture: formData.profilePicture,
      interests: formData.interests
    });
    setProfileData(updatedData);
    setFormData(updatedData);
    setIsEditing(false);
    // Update localStorage user data
    localStorage.setItem('user', JSON.stringify(updatedData));
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setIsEditing(false);
  };

  // Connect to TAMID Slack workspace
  const connectSlack = () => {
    // In real app, this would open Slack OAuth flow
    // For now, redirect to TAMID Slack workspace
    const slackWorkspaceUrl = "https://tamidgroup.slack.com"; // Replace with actual TAMID Slack URL
    window.open(slackWorkspaceUrl, "_blank");
    // In real app, after OAuth, update profileData.slackSynced to true
    setProfileData({ ...profileData, slackSynced: true });
  };

  // Disconnect from Slack
  const disconnectSlack = () => {
    // In real app, this would call API to disconnect
    setProfileData({ ...profileData, slackSynced: false });
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToMatch = () => {
    navigate("/find-match");
  };

  const handleLogout = () => {
    // In real app, clear auth token and redirect
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <h2>TaMeet</h2>
        <ul>
          <li onClick={handleGoToDashboard} className="clickable">Dashboard</li>
          <li onClick={() => navigate("/matches")} className="clickable">Matches</li>
          <li onClick={() => navigate("/search")} className="clickable">Search</li>
          <li className="active">Profile</li>
          <li onClick={handleLogout} className="clickable" style={{ color: '#ef4444', marginTop: '20px' }}>Logout</li>
        </ul>
      </aside>

      <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-picture-section">
            <img
              src={
                profileData.profilePicture ||
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
              }
              alt="Profile"
              className="profile-picture-large"
            />
            {isEditing && (
              <button className="change-photo-btn">Change Photo</button>
            )}
          </div>

          <div className="profile-header-info">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="profile-input-large"
                placeholder="Your name"
              />
            ) : (
              <h1 className="profile-name">{profileData.name}</h1>
            )}

            <p className="profile-email">{profileData.email}</p>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">{profileData.following}</span>
                <span className="stat-label">Following</span>
              </div>
              <div className="stat">
                <span className="stat-number">{profileData.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
            </div>
          </div>

          <div className="profile-header-actions">
            {isEditing ? (
              <>
                <button className="btn-save" onClick={handleSave}>
                  Save Changes
                </button>
                <button className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="btn-edit"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Bio Section */}
        <div className="profile-section">
          <h2 className="section-title">About Me</h2>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="profile-textarea"
              placeholder="Tell others about yourself..."
              rows="4"
            />
          ) : (
            <p className="section-text">
              {profileData.bio || "No bio added yet."}
            </p>
          )}
        </div>

        {/* Interests Section */}
        <div className="profile-section">
          <h2 className="section-title">Interests</h2>
          <div className="tags-container">
            {(formData.interests || []).map((interest, index) => (
              <div key={index} className="tag">
                {interest}
                {isEditing && (
                  <button
                    className="tag-remove"
                    onClick={() => removeItem("interests", index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="add-item-row">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  addItem("interests", newInterest, setNewInterest)
                }
                placeholder="Add an interest"
                className="add-item-input"
              />
              <button
                className="btn-add"
                onClick={() =>
                  addItem("interests", newInterest, setNewInterest)
                }
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Goals Section */}
        <div className="profile-section">
          <h2 className="section-title">What I'm Looking For</h2>
          <ul className="goals-list">
            {(formData.goals || []).map((goal, index) => (
              <li key={index} className="goal-item">
                {goal}
                {isEditing && (
                  <button
                    className="item-remove"
                    onClick={() => removeItem("goals", index)}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
          {isEditing && (
            <div className="add-item-row">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && addItem("goals", newGoal, setNewGoal)
                }
                placeholder="Add a goal or takeaway"
                className="add-item-input"
              />
              <button
                className="btn-add"
                onClick={() => addItem("goals", newGoal, setNewGoal)}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Activity Preferences */}
        <div className="profile-section">
          <h2 className="section-title">Activity Preferences</h2>
          <div className="tags-container">
            {(formData.activityPreferences || []).map((activity, index) => (
              <div key={index} className="tag tag-activity">
                {activity}
                {isEditing && (
                  <button
                    className="tag-remove"
                    onClick={() => removeItem("activityPreferences", index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="add-item-row">
              <input
                type="text"
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  addItem(
                    "activityPreferences",
                    newActivity,
                    setNewActivity
                  )
                }
                placeholder="Add activity idea (e.g., coffee, lunch, virtual)"
                className="add-item-input"
              />
              <button
                className="btn-add"
                onClick={() =>
                  addItem(
                    "activityPreferences",
                    newActivity,
                    setNewActivity
                  )
                }
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Slack Integration */}
        <div className="profile-section">
          <h2 className="section-title">Slack Integration</h2>
          <div className="slack-sync">
            {profileData.slackSynced ? (
              <div className="sync-status synced">
                <span className="sync-icon">✓</span>
                <span>Connected to TAMID Slack</span>
                <button className="btn-unsync" onClick={disconnectSlack}>
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="sync-status not-synced">
                <span className="sync-icon">○</span>
                <span>Not connected to Slack</span>
                <button className="btn-sync" onClick={connectSlack}>
                  Connect to TAMID Slack
                </button>
              </div>
            )}
            <p className="slack-description">
              Connect to TAMID Slack to message your matches directly. All conversations will happen in Slack.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Profile;
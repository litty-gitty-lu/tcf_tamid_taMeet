import React, { useState, useEffect } from "react";
import "./Profile.css";


/**
 * Shows and manages user profile information including personal details,
 * interests, goals, and calendar sync status. Supports view and edit modes.
 * 
 * @component
 * @returns {JSX.Element} The rendered profile page
 * 
 * State Properties:
 * @property {string} name  The name of the user
 * @property {string} email The email of the user
 * @property {string} bio The description of the user
 * @property {string[]} interests Interests given by the user
 * @property {string[]} goals Goals given by the user
 * @property {string[]} activityPreferences Activity preferences given by the user
 * @property {boolean} calendarSynced True if calendar is synced, false otherwise
 * @property {string} profilePicture URL to an image of the user
 * @property {number} following The number of users being followed
 * @property {number} followers The number of followers a user has
 */

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    interests: [],
    goals: [],
    activityPreferences: [],
    calendarSynced: false,
    profilePicture: "",
    following: 0,
    followers: 0,
  });

  const [formData, setFormData] = useState({ ...profileData }); // Creates a copy of the profile (let's you cancel changes)
  const [newInterest, setNewInterest] = useState(""); // Creates changes in the empty profile
  const [newGoal, setNewGoal] = useState("");
  const [newActivity, setNewActivity] = useState("");

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []); // Will run the code and only run once

  const fetchProfileData = async () => { // Will get the data from the profile
    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setProfileData(data); // updates the profile with the new data
      setFormData(data);
    } catch (error) {
      console.error("Error fetching profile:", error); // will show an error and won't crash the profile
    }
  };

  const handleInputChange = (e) => { // handles input changes to different fields
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // makes a copy of the data and updates fields
  };

  const addItem = (type, value, setter) => { // adds values to the fields in profile
    if (value.trim()) { // removes spaces before and after (checks if it's empty)
      setFormData({
        ...formData,
        [type]: [...formData[type], value.trim()], // copies the data then adds the new value to the end of the array
      });
      setter(""); // clears input field so you can keep adding items
    }
  };

  const removeItem = (type, index) => { // Removes an item from the array
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, i) => i !== index), // creates a new array without the item at an index
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfileData(updatedData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setIsEditing(false);
  };

  const syncCalendar = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/calendar/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData({ ...profileData, calendarSynced: true });
      }
    } catch (error) {
      console.error("Error syncing calendar:", error);
    }
  };

  return (
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
            {formData.interests.map((interest, index) => (
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
            {formData.goals.map((goal, index) => (
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
            {formData.activityPreferences.map((activity, index) => (
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

        {/* Calendar Sync */}
        <div className="profile-section">
          <h2 className="section-title">Calendar Integration</h2>
          <div className="calendar-sync">
            {profileData.calendarSynced ? (
              <div className="sync-status synced">
                <span className="sync-icon">✓</span>
                <span>Calendar synced</span>
                <button className="btn-unsync">Disconnect</button>
              </div>
            ) : (
              <div className="sync-status not-synced">
                <span className="sync-icon">○</span>
                <span>Calendar not synced</span>
                <button className="btn-sync" onClick={syncCalendar}>
                  Sync Calendar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

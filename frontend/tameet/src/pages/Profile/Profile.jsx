import React, { useState, useEffect } from "react";
import "./Profile.css";

/**
 * Profile Component (Frontend Only - No Backend Required)
 * 
 * Displays and manages user profile information with view and edit modes.
 * Uses mock data instead of API calls for testing the UI.
 * 
 * @component
 * @returns {JSX.Element} The rendered Profile component
 */
const Profile = () => {
  /**
   * Controls whether the profile is in edit mode or view mode
   * @type {[boolean, Function]}
   * @default false
   */
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Mock profile data - simulates data from a backend API
   * @typedef {Object} ProfileData
   * @property {string} name - User's full name
   * @property {string} email - User's email address
   * @property {string} bio - User's biography/description
   * @property {string[]} interests - Array of user interests
   * @property {string[]} goals - Array of what user wants from coffee chats
   * @property {string[]} activityPreferences - Preferred meeting types
   * @property {boolean} calendarSynced - Whether calendar is synced
   * @property {string} profilePicture - URL to user's profile picture
   * @property {number} following - Count of users following
   * @property {number} followers - Count of followers
   */
  const [profileData, setProfileData] = useState({
    name: "Samantha Rodriguez",
    email: "samantha@northeastern.edu",
    bio: "Coffee enthusiast and aspiring entrepreneur. Love connecting with people who are passionate about tech and innovation!",
    interests: ["Startups", "Coffee", "Tech", "Networking"],
    goals: [
      "Learn about product management",
      "Connect with founders in the Boston area",
      "Explore career opportunities in tech",
    ],
    activityPreferences: ["Coffee", "Lunch", "Virtual"],
    calendarSynced: false,
    profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    following: 12,
    followers: 8,
  });

  /**
   * Temporary copy of profileData used during editing
   * @type {[ProfileData, Function]}
   */
  const [formData, setFormData] = useState({ ...profileData });

  /**
   * Temporary storage for new interest being typed
   * @type {[string, Function]}
   */
  const [newInterest, setNewInterest] = useState("");

  /**
   * Temporary storage for new goal being typed
   * @type {[string, Function]}
   */
  const [newGoal, setNewGoal] = useState("");

  /**
   * Temporary storage for new activity preference being typed
   * @type {[string, Function]}
   */
  const [newActivity, setNewActivity] = useState("");

  // Note: No API call needed! Data is already loaded above
  useEffect(() => {
    console.log("Profile loaded with mock data");
  }, []);

  /**
   * Handles input field changes during profile editing
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e - The change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Adds a new item to an array field
   * @param {string} type - The field name ("interests", "goals", or "activityPreferences")
   * @param {string} value - The value to add
   * @param {Function} setter - State setter to clear input
   */
  const addItem = (type, value, setter) => {
    if (value.trim()) {
      setFormData({
        ...formData,
        [type]: [...formData[type], value.trim()],
      });
      setter("");
    }
  };

  /**
   * Removes an item from an array field by index
   * @param {string} type - The field name
   * @param {number} index - The array index to remove
   */
  const removeItem = (type, index) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, i) => i !== index),
    });
  };

  /**
   * Saves the edited profile (frontend only - just updates state)
   */
  const handleSave = () => {
    // In frontend-only mode, just update profileData directly
    setProfileData(formData);
    setIsEditing(false);
    console.log("Profile saved (frontend only):", formData);
    alert("Profile saved successfully! ✅");
  };

  /**
   * Cancels editing and discards changes
   */
  const handleCancel = () => {
    setFormData({ ...profileData });
    setIsEditing(false);
  };

  /**
   * Toggles calendar sync status (frontend only)
   */
  const syncCalendar = () => {
    setProfileData({ ...profileData, calendarSynced: true });
    console.log("Calendar synced (frontend only)");
    alert("Calendar synced! ✅");
  };

  /**
   * Disconnects calendar sync (frontend only)
   */
  const unsyncCalendar = () => {
    setProfileData({ ...profileData, calendarSynced: false });
    console.log("Calendar unsynced (frontend only)");
  };

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-picture-section">
            <img
              src={profileData.profilePicture}
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
                <button className="btn-unsync" onClick={unsyncCalendar}>
                  Disconnect
                </button>
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
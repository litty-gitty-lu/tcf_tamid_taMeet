import React, { useState } from "react";
import "./Onboarding.css";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../utils/api";

/**
 * Onboarding component - First step after user signs up
 * Allows users to set up their profile with name, bio, and profile picture
 * After completion, navigates to interests selection page
 */
export default function Onboarding() {
  const navigate = useNavigate();
  
  // State to manage form data including name, bio, and profile picture
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    profilePicture: null,
    profilePicturePreview: null,
  });

  // Handle text input changes for name and bio fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle profile picture file upload and create preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profilePicture: file,
          profilePicturePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission - saves profile data and navigates to interests page
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Save profile data to backend API
    await apiPost('/profile/onboarding', {
      name: formData.name,
      bio: formData.bio,
      profile_picture: formData.profilePicturePreview, // For now, just the preview URL
      interests: [] // Will be set in interests page
    });
    
    // Navigate to interests selection page
    navigate("/interests");
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1>Welcome to TaMeet!</h1>
          <p>Let's set up your profile</p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {/* Profile Picture Upload */}
          <div className="form-section">
            <label className="form-label">Profile Picture</label>
            <div className="photo-upload-area">
              {formData.profilePicturePreview ? (
                <div className="photo-preview">
                  <img
                    src={formData.profilePicturePreview}
                    alt="Profile preview"
                    className="preview-image"
                  />
                  <button
                    type="button"
                    className="change-photo-btn"
                    onClick={() => document.getElementById("photo-input").click()}
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <div className="photo-upload-placeholder">
                  <button
                    type="button"
                    className="upload-btn"
                    onClick={() => document.getElementById("photo-input").click()}
                  >
                    Upload Photo
                  </button>
                </div>
              )}
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Name */}
          <div className="form-section">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              className="form-input"
              required
            />
          </div>

          {/* Bio */}
          <div className="form-section">
            <label htmlFor="bio" className="form-label">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              className="form-textarea"
              rows="5"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Continue to Interests
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


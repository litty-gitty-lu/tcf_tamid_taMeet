import React, { useState } from "react";
import "./Interests.css";
import { useNavigate } from "react-router-dom";
import { apiPut } from "../../utils/api";

/**
 * Interests component - Second step in onboarding process
 * Allows users to select professional interests that will be used for matching
 * Users can select multiple interests from professional categories
 */
export default function Interests() {
  const navigate = useNavigate();
  
  // Track which interests the user has selected
  const [selectedInterests, setSelectedInterests] = useState(new Set());

  // Professional interest categories organized for networking and career development
  const interestCategories = {
    "Professional Interests": [
      { id: "product-management", name: "Product Management" },
      { id: "software-engineering", name: "Software Engineering" },
      { id: "data-science", name: "Data Science" },
      { id: "business-strategy", name: "Business Strategy" },
      { id: "marketing", name: "Marketing" },
      { id: "finance", name: "Finance" },
      { id: "consulting", name: "Consulting" },
      { id: "entrepreneurship", name: "Entrepreneurship" },
    ],
    "Industries": [
      { id: "technology", name: "Technology" },
      { id: "healthcare", name: "Healthcare" },
      { id: "finance-banking", name: "Finance & Banking" },
      { id: "consulting-services", name: "Consulting Services" },
      { id: "startups", name: "Startups" },
      { id: "venture-capital", name: "Venture Capital" },
    ],
    "Skills & Activities": [
      { id: "networking", name: "Networking" },
      { id: "mentorship", name: "Mentorship" },
      { id: "public-speaking", name: "Public Speaking" },
      { id: "leadership", name: "Leadership" },
      { id: "team-collaboration", name: "Team Collaboration" },
      { id: "project-management", name: "Project Management" },
    ],
  };

  // Toggle interest selection - add if not selected, remove if already selected
  const toggleInterest = (interestId) => {
    const newSelected = new Set(selectedInterests);
    if (newSelected.has(interestId)) {
      newSelected.delete(interestId);
    } else {
      newSelected.add(interestId);
    }
    setSelectedInterests(newSelected);
  };

  // Handle continue button - saves selected interests and navigates to dashboard
  const handleContinue = async () => {
    // Get interest names from selected IDs
    const allInterests = Object.values(interestCategories).flat();
    const selectedInterestNames = allInterests
      .filter(interest => selectedInterests.has(interest.id))
      .map(interest => interest.name);
    
    // Save selected interests to backend API
    await apiPut('/profile', {
      interests: selectedInterestNames
    });
    
    // Navigate to main dashboard
    navigate("/dashboard");
  };

  // Handle skip button - allows users to skip interest selection
  const handleSkip = () => {
    // Navigate to dashboard without saving any interests
    navigate("/dashboard");
  };

  // Flatten all interest categories into a single array for display
  const allInterests = Object.values(interestCategories).flat();

  return (
    <div className="interests-page">
      <div className="interests-container">
        <div className="interests-header">
          <h1>Select Your Interests</h1>
          <p>Choose the interests that describe you</p>
        </div>

        <div className="interests-grid">
          {allInterests.map((interest) => {
            const isSelected = selectedInterests.has(interest.id);
            return (
              <button
                key={interest.id}
                type="button"
                className={`interest-bubble ${isSelected ? "selected" : ""}`}
                onClick={() => toggleInterest(interest.id)}
              >
                <span className="interest-name">{interest.name}</span>
              </button>
            );
          })}
        </div>

        <div className="interests-actions">
          <button type="button" className="btn-skip" onClick={handleSkip}>
            Skip for Now
          </button>
          <button
            type="button"
            className="btn-continue"
            onClick={handleContinue}
            disabled={selectedInterests.size === 0}
          >
            Continue ({selectedInterests.size} selected)
          </button>
        </div>
      </div>
    </div>
  );
}


import React, { useState } from "react";
import "./Match.css";
import { useNavigate } from "react-router-dom";

export default function Match() {
  const navigate = useNavigate();

  // Sample member data - in real app, this would come from API
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Maddie Cush",
      email: "maddie.cush@northeastern.edu",
      bio: "Business student passionate about entrepreneurship and venture capital. Love connecting with ambitious people and sharing ideas!",
      interests: ["Business", "VC", "Entrepreneurship", "Networking"],
      goals: ["Career mentorship", "Industry insights", "Building connections"],
      activityPreferences: ["Coffee", "Lunch", "Virtual"],
      profilePicture: "/imgs/maddie.jpeg",
      matchScore: 92,
    },
    {
      id: 2,
      name: "Catherine Ehrling",
      email: "catherine.ehrling@northeastern.edu",
      bio: "Software engineer interested in AI and machine learning. Always excited to discuss tech trends and career growth!",
      interests: ["AI/ML", "Tech", "Startups", "Innovation"],
      goals: ["Technical discussions", "Career advice", "Learning opportunities"],
      activityPreferences: ["Coffee", "Virtual", "Study session"],
      profilePicture: "/imgs/cat.jpeg",
      matchScore: 87,
    },
    {
      id: 3,
      name: "Druv Robinson",
      email: "druv.robinson@northeastern.edu",
      bio: "Full-stack developer and startup enthusiast. Passionate about building products and connecting with fellow entrepreneurs.",
      interests: ["Full-stack", "Startups", "React", "Product"],
      goals: ["Co-founder connections", "Technical collaboration", "Networking"],
      activityPreferences: ["Coffee", "Lunch", "Virtual"],
      profilePicture: "/imgs/druv.jpeg",
      matchScore: 89,
    },
    {
      id: 4,
      name: "Charles Adams",
      email: "charles.adams@northeastern.edu",
      bio: "Data scientist working on healthcare applications. Interested in social impact, innovation, and meaningful conversations.",
      interests: ["Data Science", "Healthcare", "Social Impact", "Python"],
      goals: ["Project collaboration", "Career growth", "Technical learning"],
      activityPreferences: ["Virtual", "Coffee", "Study session"],
      profilePicture: "/imgs/charles.jpeg",
      matchScore: 85,
    },
    {
      id: 5,
      name: "Ariadna Collbech",
      email: "ariadna.collbech@northeastern.edu",
      bio: "Product designer with a passion for UX/UI and creative problem-solving. Love connecting with creative minds and tech enthusiasts.",
      interests: ["Design", "UX/UI", "Product", "Creative"],
      goals: ["Design feedback", "Portfolio review", "Industry trends"],
      activityPreferences: ["Coffee", "Virtual", "Studio visit"],
      profilePicture: "/imgs/ariadna.jpeg",
      matchScore: 83,
    },
  ]);

  const [filter, setFilter] = useState("all"); // all, high, medium, low
  const [selectedMember, setSelectedMember] = useState(null); // For modal
  const [likedMembers, setLikedMembers] = useState(new Set()); // Track liked members

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleLike = (member) => {
    // In real app, this would send API request
    console.log("Liked:", member.name);
    // Mark member as liked
    setLikedMembers(new Set([...likedMembers, member.id]));
  };

  const handlePass = (member) => {
    // In real app, this would send API request
    console.log("Passed on:", member.name);
    // Remove member from the list (in real app, this would be handled by backend)
    setMembers(members.filter((m) => m.id !== member.id));
  };

  const handleViewProfile = (member) => {
    setSelectedMember(member);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  const filteredMembers = members.filter((member) => {
    if (filter === "all") return true;
    if (filter === "high") return member.matchScore >= 85;
    if (filter === "medium") return member.matchScore >= 70 && member.matchScore < 85;
    if (filter === "low") return member.matchScore < 70;
    return true;
  });

  // URL for the profile picture
  const avatarUrl =
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop";

  // URL for TAMID logo
  const tamidUrl =
    "https://tamidgroup.org/resourcelibrary/wp-content/uploads/sites/57/2023/08/Horizontal-Group-Logo.png";

  return (
    <div className="match">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>TaMeet</h2>
        <ul>
          <li onClick={handleGoToDashboard} className="clickable">Dashboard</li>
          <li className="active">Match</li>
          <li onClick={handleGoToProfile} className="clickable">Profile</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <img src={tamidUrl} alt="tamidLogo" className="brand" />
          </div>

          <h1 className="topbar-title">Find Your Match</h1>

          <div className="topbar-right">
            <span className="greeting">Hi, Samantha! 👋</span>
            <button className="icon-btn" aria-label="Notifications">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3602/3602145.png"
                alt="Notification bell"
                width="20"
                height="20"
              />
            </button>
            <img src={avatarUrl} alt="Profile" className="avatar" />
          </div>
        </header>

        {/* Filter Section */}
        <section className="filter-section">
          <div className="filter-buttons">
            <button
              className={filter === "all" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("all")}
            >
              All Matches
            </button>
            <button
              className={filter === "high" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("high")}
            >
              High Match (85+)
            </button>
            <button
              className={filter === "medium" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("medium")}
            >
              Medium (70-84)
            </button>
            <button
              className={filter === "low" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("low")}
            >
              Low (Below 70)
            </button>
          </div>
          <div className="match-count">
            Showing {filteredMembers.length} {filteredMembers.length === 1 ? "match" : "matches"}
          </div>
        </section>

        {/* Member Cards Grid */}
        {filteredMembers.length > 0 ? (
          <section className="members-grid">
            {filteredMembers.map((member) => (
              <div 
                key={member.id} 
                className={`member-card ${likedMembers.has(member.id) ? 'member-card-liked' : ''}`}
              >
                <div className="member-card-header">
                  <img
                    src={member.profilePicture}
                    alt={member.name}
                    className="member-avatar"
                  />
                  <div className="member-header-info">
                    <h3 className="member-name">{member.name}</h3>
                    <div className="match-score">
                      <span className="match-score-label">Match Score</span>
                      <span className="match-score-value">{member.matchScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="member-card-body">
                  <p className="member-bio">{member.bio}</p>

                  <div className="member-section">
                    <h4 className="member-section-title">Interests</h4>
                    <div className="member-tags">
                      {member.interests.map((interest, idx) => (
                        <span key={idx} className="member-tag">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="member-section">
                    <h4 className="member-section-title">Looking For</h4>
                    <ul className="member-list">
                      {member.goals.map((goal, idx) => (
                        <li key={idx}>{goal}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="member-section">
                    <h4 className="member-section-title">Activity Preferences</h4>
                    <div className="member-tags">
                      {member.activityPreferences.map((activity, idx) => (
                        <span key={idx} className="member-tag member-tag-activity">
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="member-card-actions">
                  <button
                    className="btn-pass"
                    onClick={() => handlePass(member)}
                  >
                    Pass
                  </button>
                  <button
                    className="btn-view-profile"
                    onClick={() => handleViewProfile(member)}
                  >
                    View Profile
                  </button>
                  <button
                    className="btn-like"
                    onClick={() => handleLike(member)}
                  >
                    Like
                  </button>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <div className="no-matches">
            <p>No matches found with the selected filter.</p>
            <button className="btn-reset-filter" onClick={() => setFilter("all")}>
              Show All Matches
            </button>
          </div>
        )}
      </main>

      {/* Profile Modal */}
      {selectedMember && (
        <div className="profile-modal-overlay" onClick={handleCloseModal}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={handleCloseModal}>
              ×
            </button>
            
            <div className="profile-modal-header">
              <img
                src={selectedMember.profilePicture}
                alt={selectedMember.name}
                className="profile-modal-avatar"
              />
              <div className="profile-modal-header-info">
                <h2 className="profile-modal-name">{selectedMember.name}</h2>
                <p className="profile-modal-email">{selectedMember.email}</p>
                <div className="profile-modal-match-score">
                  <span className="match-score-label-large">Match Score</span>
                  <span className="match-score-value-large">{selectedMember.matchScore}%</span>
                </div>
              </div>
            </div>

            <div className="profile-modal-body">
              <div className="profile-modal-section">
                <h3 className="profile-modal-section-title">About</h3>
                <p className="profile-modal-bio">{selectedMember.bio}</p>
              </div>

              <div className="profile-modal-section">
                <h3 className="profile-modal-section-title">Interests</h3>
                <div className="profile-modal-tags">
                  {selectedMember.interests.map((interest, idx) => (
                    <span key={idx} className="profile-modal-tag">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="profile-modal-section">
                <h3 className="profile-modal-section-title">What They're Looking For</h3>
                <ul className="profile-modal-list">
                  {selectedMember.goals.map((goal, idx) => (
                    <li key={idx}>{goal}</li>
                  ))}
                </ul>
              </div>

              <div className="profile-modal-section">
                <h3 className="profile-modal-section-title">Activity Preferences</h3>
                <div className="profile-modal-tags">
                  {selectedMember.activityPreferences.map((activity, idx) => (
                    <span key={idx} className="profile-modal-tag profile-modal-tag-activity">
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-modal-actions">
              <button
                className="profile-modal-btn profile-modal-btn-pass"
                onClick={() => {
                  handlePass(selectedMember);
                  handleCloseModal();
                }}
              >
                Pass
              </button>
              <button
                className="profile-modal-btn profile-modal-btn-like"
                onClick={() => {
                  handleLike(selectedMember);
                  handleCloseModal();
                }}
              >
                Like
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


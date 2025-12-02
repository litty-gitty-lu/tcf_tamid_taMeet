import React from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  const handleGoToMatch = () => {
    navigate("/match");
  };

// url for the profile picture
const avatarUrl =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop";

// url for TAMID logo
const tamidUrl =
  "https://tamidgroup.org/resourcelibrary/wp-content/uploads/sites/57/2023/08/Horizontal-Group-Logo.png";

/** function to define the dashboard component of the page */
  return (
    <>
      {/** outermost div, contains everything inside the dashboard */}
      <div className="dashboard">
        {/* aside can be used as secondary to the main content but still relevant */}
        <aside className="sidebar">
          <h2>TaMeet</h2>
          <ul>
            {/* creating an unorganized list for the elements in the sidebar*/}
            <li className="active">Dashboard</li>
            <li onClick={handleGoToMatch} className="clickable">Match</li>
            <li onClick={handleGoToProfile} className="clickable">Profile</li>
          </ul>
        </aside>

        {/* main content of the page */}
        <main className="main">
          {/* header component of the main page */}
          <header className="topbar">
            <div className="topbar-left">
              <img src={tamidUrl} alt="tamidLogo" className="brand" />
            </div>

            <h1 className="topbar-title">Dashboard</h1>

            <div className="topbar-right">
              {/* in-line element to to add in the same line */}
              <span className="greeting">Hi, Samantha! 👋</span>
              {/* adding a button for design */}
              <button className="icon-btn" aria-label="Notifications">
                {/* adding the button image */}
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

          {/* the info cards below the topbar */}
          <section className="cards">
            <div className="card">Upcoming chats: 3</div>
            <div className="card">Messages: 5</div>
            <div className="card">Calendar sync: 42</div>
          </section>
        </main>
      </div>
    </>
  );
}

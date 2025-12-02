import React, { useState } from "react";
import "./Messages.css";
import { useNavigate, useLocation } from "react-router-dom";

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  // Get the liked member from navigation state, or use default
  const memberData = location.state?.member;
  const likedMember = memberData ? {
    ...memberData,
    sharedInterest: memberData.interests?.[0] || "Networking",
    userId: `#${memberData.id.toString().padStart(6, '0').toUpperCase()}`,
  } : {
    id: 1,
    name: "Zoe Rogers",
    email: "zoe.rogers@northeastern.edu",
    profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    sharedInterest: "Marketing Analytics",
    userId: "#CU6798H",
  };

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "OP",
      text: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
      timestamp: "8:00 PM",
      isUser: false,
    },
    {
      id: 2,
      sender: "You",
      text: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
      timestamp: "8:00 PM",
      isUser: true,
    },
    {
      id: 3,
      sender: "OP",
      text: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
      timestamp: "8:00 PM",
      isUser: false,
    },
    {
      id: 4,
      sender: "You",
      text: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
      timestamp: "8:00 PM",
      isUser: true,
    },
  ]);

  // Sample past chats
  const [pastChats] = useState([
    {
      id: 1,
      name: "Linda Galway",
      profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      lastMessage: "Hey, how are you?",
      timestamp: "2:30 PM",
    },
    {
      id: 2,
      name: "Aaron Sander",
      profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      lastMessage: "Thanks for the chat!",
      timestamp: "1:15 PM",
    },
    {
      id: 3,
      name: "Ivan Bayers",
      profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      lastMessage: "See you tomorrow!",
      timestamp: "12:00 PM",
    },
    {
      id: 4,
      name: "Joshua Quinton",
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      lastMessage: "Great talking with you!",
      timestamp: "11:45 AM",
    },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "You",
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: true,
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToMatch = () => {
    navigate("/match");
  };

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  const handleSelectChat = (chat) => {
    // In real app, this would load the chat
    console.log("Selected chat:", chat.name);
  };

  return (
    <div className="messages-container">
      {/* Left Sidebar */}
      <aside className="messages-sidebar">
        {/* TAMID Logo Section */}
        <div className="sidebar-header">
          <div className="tamid-logo-section">
            <div className="tamid-logo-icon">T</div>
            <div className="tamid-logo-text">
              <div className="tamid-logo-main">TAMID GROUP</div>
              <div className="tamid-logo-sub">AT NORTHEASTERN</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          <div className="nav-item">
            <span className="nav-icon">🔍</span>
            <span>Search chats</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">⭐</span>
            <span>Favorited chats</span>
          </div>
        </div>

        {/* Past Chats Section */}
        <div className="past-chats-section">
          <h3 className="past-chats-heading">Past Chats</h3>
          <div className="new-chat-button">
            <span className="nav-icon">+</span>
            <span>New Chat</span>
          </div>
        </div>

        {/* Contact List */}
        <div className="contact-list">
          {pastChats.map((chat) => (
            <div
              key={chat.id}
              className="contact-item"
              onClick={() => handleSelectChat(chat)}
            >
              <img
                src={chat.profilePicture}
                alt={chat.name}
                className="contact-avatar"
              />
              <div className="contact-info">
                <div className="contact-name">{chat.name}</div>
                <div className="contact-last-message">{chat.lastMessage}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="sidebar-footer">
          <div className="tamid-plus-logo">
            <div className="tamid-plus-icon">T</div>
            <span>TaUser Plus</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="messages-main">
        {/* Chat Header */}
        <header className="chat-header">
          <div className="chat-header-left">
            <img
              src={likedMember.profilePicture}
              alt={likedMember.name}
              className="chat-header-avatar"
            />
            <div className="chat-header-info">
              <div className="chat-header-name">
                {likedMember.name}
                <span className="chat-header-id">{likedMember.userId}</span>
              </div>
              <div className="chat-header-interest">
                Shared interest: {likedMember.sharedInterest}
              </div>
            </div>
          </div>
          <div className="chat-header-right">
            <button className="header-icon-btn" aria-label="Phone call">
              <span>📞</span>
            </button>
            <button className="header-icon-btn" aria-label="Video call">
              <span>📹</span>
            </button>
            <button className="header-icon-btn" aria-label="Info">
              <span>ℹ️</span>
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="messages-area">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble ${msg.isUser ? "message-user" : "message-other"}`}
            >
              {!msg.isUser && (
                <div className="message-avatar-container">
                  <div className="message-avatar-circle">OP</div>
                </div>
              )}
              <div className="message-content">
                <div className="message-text">{msg.text}</div>
                <div className="message-timestamp">{msg.timestamp}</div>
              </div>
              {msg.isUser && (
                <div className="message-avatar-container">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
                    alt="You"
                    className="message-user-avatar"
                  />
                </div>
              )}
            </div>
          ))}
          {/* Typing indicator */}
          <div className="message-bubble message-other">
            <div className="message-avatar-container">
              <div className="message-avatar-circle">OP</div>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="message-input-container">
          <form onSubmit={handleSendMessage} className="message-input-form">
            <input
              type="text"
              className="message-input"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="message-send-btn" aria-label="Send">
              <span>✈️</span>
            </button>
            <button type="button" className="message-attach-btn" aria-label="Attach">
              <span>📎</span>
            </button>
            <button type="button" className="message-check-btn" aria-label="Check">
              <span>✓</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}


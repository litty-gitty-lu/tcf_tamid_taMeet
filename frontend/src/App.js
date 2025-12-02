import React from 'react';
import './App.css';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Match from "./pages/Match/Match";
import Onboarding from "./pages/Onboarding/Onboarding";
import Interests from "./pages/Interests/Interests";
import FindMatch from "./pages/FindMatch/FindMatch";
import MatchResult from "./pages/MatchResult/MatchResult";
import Matches from "./pages/Matches/Matches";
import Search from "./pages/Search/Search";
import UserProfile from "./pages/UserProfile/UserProfile";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/interests" element={<Interests />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/match" element={<Match />} />
        <Route path="/find-match" element={<FindMatch />} />
        <Route path="/match-result" element={<MatchResult />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/user/:userId" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

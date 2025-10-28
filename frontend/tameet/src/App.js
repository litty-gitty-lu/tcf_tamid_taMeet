import React from 'react';
import './App.css';
import SignIn from './pages/SignIn';
import Dashboard from "./pages/Dashboard/Dashboard";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

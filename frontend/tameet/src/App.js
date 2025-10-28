import React from 'react';
import './App.css';
import SignIn from './pages/SignIn';
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="App">
      <SignIn />
      <Dashboard />;
    </div>
  );
}

export default App;

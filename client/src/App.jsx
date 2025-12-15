import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Main from './pages/Main';
import Tree from './pages/Tree';
import SharedTree from './pages/SharedTree';
import Memories from './pages/Memories';
import Settings from './pages/Settings';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        {/* Pass user to Main, or handle login/user state more globally */}
        <Route path="/main" element={user ? <Main user={user} /> : <Navigate to="/login" />} />
        <Route path="/tree" element={user ? <Tree user={user} /> : <Navigate to="/login" />} />
        <Route path="/view/:token" element={<SharedTree />} />
        <Route path="/memories" element={user ? <Memories user={user} /> : <Navigate to="/login" />} />
        <Route path="/memories/:memberId" element={user ? <Memories user={user} /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings user={user} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/signup" />} />
      </Routes>
    </Router>
  );
}

export default App;


import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen-container">
      <div className="modern-loader"></div>
      <div className="loading-text">Loading Family Tree...</div>
      
      <div className="developer-credit">
        Developed by
        <span className="developer-name">Paremeshwer Suthar</span>
      </div>
    </div>
  );
};

export default LoadingScreen;

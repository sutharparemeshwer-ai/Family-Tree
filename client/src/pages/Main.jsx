import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Main.css';

const Main = () => {
  const navigate = useNavigate();

  const handleNavigateToTree = () => {
    navigate('/tree');
  };

  return (
    <div className="main-page-container">
      <Navbar />
      <section className="hero-section">
        <h1 className="hero-title">Welcome to the Family Tree</h1>
        <p className="hero-subtitle">Draw your family in a creative way</p>
        <button className="hero-cta-btn" onClick={handleNavigateToTree}>Make Your Tree Now</button>
      </section>
    </div>
  );
};

export default Main;

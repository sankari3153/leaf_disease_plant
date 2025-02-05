import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle the scroll event
  const handleScroll = () => {
    if (window.scrollY > 100) {
      setIsScrolled(true); // Trigger notification when scroll position exceeds 100px
    } else {
      setIsScrolled(false);
    }
  };

  // Attach the scroll listener on component mount
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="home-page">
      <div className="content">
        <h1>Welcome to the Plant Disease Prediction System</h1>
        <p>
          This system allows you to upload images of sugarcane leaves and classify potential diseases.
        </p>

        {/* Scroll Notification */}
        {isScrolled && (
          <div className="scroll-notification">
            <p>Scroll down to start uploading and predicting disease!</p>
          </div>
        )}

        {/* Start Prediction Button */}
        <Link to="/predict">
          <button className="start-button">Start Prediction</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;

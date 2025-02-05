import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import PlantDiseasePredictor from './PlantDiseasePredictor';
import './App.css'; // Import global styles

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/predict" element={<PlantDiseasePredictor />} />
      </Routes>
    </Router>
  );
}

export default App;

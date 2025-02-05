import React, { useState } from 'react';
import axios from 'axios';
import './PlantDiseasePredictor.css'; // Import the updated CSS file

const PlantDiseasePredictor = () => {
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [serverAvailable, setServerAvailable] = useState(true);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        if (selectedFiles.length > 20) {
            setError('Please select up to 20 images.');
            setFiles([]);
        } else if (selectedFiles.length === 0) {
            setError('Please select at least one image.');
            setFiles([]);
        } else {
            setFiles(selectedFiles);
            setError(null);
        }

        setResults([]); // Reset results when new files are selected
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            setError('Please select at least one image file.');
            return;
        }

        setLoading(true);
        setError(null);
        const newResults = [];

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                const response = await axios.post('http://127.0.0.1:8000/classify_all', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                newResults.push({
                    fileName: file.name,
                    classification: response.data.classification,
                    probability: response.data.probability,
                    description: response.data.description,
                    symptoms: response.data.symptoms,
                    causes: response.data.causes,
                    showDetails: { description: false, symptoms: false, causes: false },
                });
            }

            setResults(newResults);
            setServerAvailable(true);
        } catch (err) {
            console.error('Error occurred:', err);
            setServerAvailable(false);
            setError('Server unavailable. Displaying preloaded disease descriptions.');
        } finally {
            setLoading(false);
        }
    };

    const toggleDetail = (index, detailType) => {
        setResults(results.map((result, i) => {
            if (i === index) {
                return {
                    ...result,
                    showDetails: {
                        ...result.showDetails,
                        [detailType]: !result.showDetails[detailType],
                    },
                };
            }
            return result;
        }));
    };

    const renderButtons = (result, index) => (
        <div className="button-group">
            <button onClick={() => toggleDetail(index, 'description')}>
                {result.showDetails.description ? 'Hide Description' : 'Show Description'}
            </button>
            <button onClick={() => toggleDetail(index, 'symptoms')}>
                {result.showDetails.symptoms ? 'Hide Symptoms' : 'Show Symptoms'}
            </button>
            <button onClick={() => toggleDetail(index, 'causes')}>
                {result.showDetails.causes ? 'Hide Causes' : 'Show Causes'}
            </button>
        </div>
    );

    return (
        <div className="predictor-container">
            <h2 className="header">🌾 Sugarcane Leaf Disease Predictor 🌱</h2>

            <div className="file-input-section">
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="file-input"
                />
                {files.length > 0 && (
                    <button onClick={handleSubmit} disabled={loading} className="submit-button">
                        {loading ? 'Processing...' : 'Classify'}
                    </button>
                )}
            </div>

            {error && <div className="error">{error}</div>}

            <div className="results-container">
                {results.map((result, index) => (
                    <div key={index} className="result-card">
                        <h3>{result.fileName}</h3>
                        <p>
                            <strong>Classification:</strong> {result.classification}
                        </p>
                        <p>
                            <strong>Probability:</strong> {(result.probability * 100).toFixed(2)}%
                        </p>

                        {renderButtons(result, index)}

                        {result.showDetails.description && (
                            <p>
                                <strong>Description:</strong> {result.description}
                            </p>
                        )}
                        {result.showDetails.symptoms && (
                            <p>
                                <strong>Symptoms:</strong> {result.symptoms}
                            </p>
                        )}
                        {result.showDetails.causes && (
                            <p>
                                <strong>Causes:</strong> {result.causes}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {loading && <div className="spinner"></div>}

            {/* Footer Section */}
            <footer className="footer">© 2024 Sugarcane Leaf Disease Predictor. All Rights Reserved.</footer>
        </div>
    );
};

export default PlantDiseasePredictor;

import React, { useState } from 'react';
import axios from 'axios';
import './SearchMovies.css';

const SearchMovies = ({ onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:8080/api/tmdb/search?query=${encodeURIComponent(searchTerm)}`);
      console.log('API Yanıtı:', response.data);
      
      if (response.data && response.data.data) {
        onSearchResults(response.data.data);
      } else {
        onSearchResults([]);
      }
    } catch (error) {
      console.error('Film arama hatası:', error);
      setError('Film arama sırasında bir hata oluştu');
      onSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Film ara..."
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Aranıyor...' : 'Ara'}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default SearchMovies; 
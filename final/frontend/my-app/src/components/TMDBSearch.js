import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TMDBSearch = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMovies = async () => {
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/tmdb/search?query=${query}`
      );
      setMovies(response.data); 
    } catch (err) {
      setError('Bir hata oluştu. Verileri alamadık.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMovies();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>TMDB Film Arama</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Film adı girin..."
          style={{ padding: '10px', width: '300px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '10px' }}>
          Ara
        </button>
      </form>
      {loading && <p>Yükleniyor...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        {movies.length > 0 && (
          <ul>
            {movies.map((movie, index) => (
              <li key={index} style={{ margin: '10px 0' }}>
                <strong>{movie.title}</strong> - {movie.release_date}
                <p>{movie.overview}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TMDBSearch;

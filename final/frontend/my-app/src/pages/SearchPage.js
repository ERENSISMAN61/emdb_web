import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import MovieGrid from '../components/MovieGrid';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const query = searchParams.get('q');

  useEffect(() => {
    const searchContent = async () => {
      if (!query) return;

      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/tmdb/search?query=${encodeURIComponent(query)}`);
        if (response.data && response.data.data) {
          setMovies(response.data.data);
        }
      } catch (error) {
        console.error('Arama hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    searchContent();
  }, [query]);

  return (
    <div className="search-page">
      <div className="search-header">
        <h2>"{query}" için arama sonuçları</h2>
      </div>
      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : (
        <>
          {movies.length > 0 ? (
            <div className="search-section">
              <MovieGrid movies={movies} />
            </div>
          ) : (
            <div className="no-results">
              Aramanızla eşleşen bir sonuç bulunamadı.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieGrid from '../components/MovieGrid';
import './ContentPages.css';

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState('popular'); // 'popular' veya 'newest'

  useEffect(() => {
    fetchMovies();
  }, [sortType]);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/movies');
      if (response.data && response.data.data) {
        let sortedMovies = [...response.data.data];
        
        if (sortType === 'newest') {
          sortedMovies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        } else {
          sortedMovies.sort((a, b) => b.popularity - a.popularity);
        }
        
        setMovies(sortedMovies);
      }
    } catch (error) {
      console.error('Filmler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-page">
      <div className="content-header">
        <h1>Filmler</h1>
        <p>En popüler ve en yeni filmler</p>
        <div className="sort-buttons">
          <button 
            className={`sort-button ${sortType === 'popular' ? 'active' : ''}`}
            onClick={() => setSortType('popular')}
          >
            En Popüler Filmler
          </button>
          <button 
            className={`sort-button ${sortType === 'newest' ? 'active' : ''}`}
            onClick={() => setSortType('newest')}
          >
            En Yeni Filmler
          </button>
        </div>
      </div>
      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : (
        <MovieGrid movies={movies} />
      )}
    </div>
  );
};

export default MoviesPage; 
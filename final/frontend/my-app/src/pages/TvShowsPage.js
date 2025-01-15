import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieGrid from '../components/MovieGrid';
import './ContentPages.css';

const TvShowsPage = () => {
  const [tvShows, setTvShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState('popular'); // 'popular' veya 'newest'

  useEffect(() => {
    fetchTvShows();
  }, [sortType]);

  const fetchTvShows = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/tv-shows');
      if (response.data && response.data.data) {
        let sortedShows = [...response.data.data];
        
        if (sortType === 'newest') {
          sortedShows.sort((a, b) => new Date(b.first_air_date) - new Date(a.first_air_date));
        } else {
          sortedShows.sort((a, b) => b.popularity - a.popularity);
        }
        
        setTvShows(sortedShows);
      }
    } catch (error) {
      console.error('Diziler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-page">
      <div className="content-header">
        <h1>Diziler</h1>
        <p>En popüler ve en yeni diziler</p>
        <div className="sort-buttons">
          <button 
            className={`sort-button ${sortType === 'popular' ? 'active' : ''}`}
            onClick={() => setSortType('popular')}
          >
            En Popüler Diziler
          </button>
          <button 
            className={`sort-button ${sortType === 'newest' ? 'active' : ''}`}
            onClick={() => setSortType('newest')}
          >
            En Yeni Diziler
          </button>
        </div>
      </div>
      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : (
        <MovieGrid movies={tvShows} isShow={true} />
      )}
    </div>
  );
};

export default TvShowsPage; 
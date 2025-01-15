import React from 'react';
import { Link } from 'react-router-dom';
import './MovieGrid.css';

const MovieGrid = ({ movies, isShow = false }) => {
  return (
    <div className="movie-grid-container">
      <div className="movie-grid">
        {movies.map((movie) => (
          <Link 
            to={isShow ? `/tv-show/${movie.id}` : `/movie/${movie.id}`} 
            key={movie.id} 
            className="movie-card"
          >
            <div className="movie-poster">
              {movie.poster_path ? (
                <img src={movie.poster_path} alt={movie.title} />
              ) : (
                <div className="no-poster">Görsel Yok</div>
              )}
            </div>
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <div className="movie-rating">%{Math.round(movie.vote_average * 10)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MovieGrid;

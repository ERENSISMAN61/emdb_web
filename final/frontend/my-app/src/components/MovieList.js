import React from 'react';
import './MovieList.css';

const MovieList = ({ movies }) => {
  if (!movies || movies.length === 0) {
    return <div className="no-results">Film bulunamadı</div>;
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <div key={movie.id} className="movie-card">
          {movie.poster_path ? (
            <img
              src={movie.poster_path}
              alt={movie.title}
              className="movie-poster"
            />
          ) : (
            <div className="no-poster">Poster Yok</div>
          )}
          <div className="movie-info">
            <h3>{movie.title}</h3>
            <p className="release-date">
              {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Tarih Yok'}
            </p>
            <div className="movie-rating">
              {movie.vote_average ? (
                <span>⭐ {movie.vote_average.toFixed(1)}</span>
              ) : null}
            </div>
            <p className="movie-overview">
              {movie.overview ? (
                movie.overview.length > 150
                  ? `${movie.overview.substring(0, 150)}...`
                  : movie.overview
              ) : 'Açıklama bulunmuyor'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovieList; 
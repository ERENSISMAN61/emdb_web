import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import MovieGrid from '../components/MovieGrid';
import './MovieDetailPage.css';

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ content: '', rating: 5 });
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const location = useLocation();
  const [isShow, setIsShow] = useState(location.pathname.includes('/tv-show/'));

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/reviews?populate[user]=*&filters[${isShow ? 'tvShowId' : 'movieId'}]=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('Gelen yorumlar:', response.data);
      if (response.data && response.data.data) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
      setReviews([]);
    }
  }, [id, isShow]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const apiKey = '8e3701a5c9361b5215a968db8c7d6e40';
        const contentType = location.pathname.includes('/tv-show/') ? 'tv' : 'movie';
        const response = await axios.get(
          `https://api.themoviedb.org/3/${contentType}/${id}?api_key=${apiKey}&language=tr-TR`
        );

        if (response.data) {
          const data = response.data;
          setMovie({
            id: data.id,
            title: contentType === 'tv' ? data.name : data.title,
            overview: data.overview,
            poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
            backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
            vote_average: data.vote_average,
            vote_count: data.vote_count,
            release_date: contentType === 'tv' ? data.first_air_date : data.release_date,
            runtime: data.runtime || null,
            number_of_seasons: data.number_of_seasons,
            number_of_episodes: data.number_of_episodes,
            genres: data.genres || []
          });
          setIsShow(contentType === 'tv');
          
          // Kredi bilgilerini al
          const creditsResponse = await axios.get(
            `https://api.themoviedb.org/3/${contentType}/${id}/credits?api_key=${apiKey}&language=tr-TR`
          );
          
          if (creditsResponse.data) {
            const credits = creditsResponse.data;
            const director = contentType === 'movie' 
              ? credits.crew.find(person => person.job === 'Director')
              : null;
            const cast = credits.cast.slice(0, 5);
            
            setMovie(prev => ({
              ...prev,
              director: director ? {
                id: director.id,
                name: director.name
              } : null,
              cast: cast.map(actor => ({
                id: actor.id,
                name: actor.name,
                character: actor.character,
                profile_path: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null
              }))
            }));
          }
          
          // Benzer içerikleri al
          const similarResponse = await axios.get(
            `https://api.themoviedb.org/3/${contentType}/${id}/similar?api_key=${apiKey}&language=tr-TR&page=1`
          );
          
          if (similarResponse.data && similarResponse.data.results) {
            const similarContent = similarResponse.data.results.slice(0, 6).map(item => ({
              id: item.id,
              title: contentType === 'tv' ? item.name : item.title,
              poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
              vote_average: item.vote_average
            }));
            
            setMovie(prev => ({
              ...prev,
              similar_movies: similarContent
            }));
          }
        }
      } catch (error) {
        console.error('İçerik detayları yüklenirken hata:', error);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
    fetchReviews();
  }, [id, location.pathname, fetchReviews]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Yorum yapmak için giriş yapmalısınız');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const reviewData = {
        data: {
          content: newReview.content,
          rating: parseInt(newReview.rating),
          user: user.id,
          [isShow ? 'tvShowId' : 'movieId']: parseInt(id)
        }
      };

      const response = await axios.post(
        'http://localhost:8080/api/reviews',
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Yorum gönderme yanıtı:', response.data);
      if (response.data && response.data.data) {
        await fetchReviews();
        setNewReview({ content: '', rating: 5 });
        setError('');
      }
    } catch (error) {
      console.error('Yorum gönderilirken hata:', error);
      console.log('Hata detayı:', error.response?.data);
      setError(error.response?.data?.error?.message || 'Yorum gönderilirken bir hata oluştu');
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (!movie) {
    return <div className="error">İçerik bulunamadı</div>;
  }

  return (
    <div className="movie-detail">
      <div 
        className="movie-backdrop"
        style={{ backgroundImage: `url(${movie.backdrop_path})` }}
      >
        <div className="backdrop-overlay">
          <div className="movie-info">
            <div className="movie-poster">
              <img src={movie.poster_path} alt={movie.title} />
            </div>
            <div className="movie-content">
              <h1>{movie.title}</h1>
              <div className="movie-meta">
                <span className="release-date">
                  {new Date(movie.release_date).getFullYear()}
                </span>
                {movie.runtime && (
                  <span className="runtime">
                    {Math.floor(movie.runtime / 60)}s {movie.runtime % 60}d
                  </span>
                )}
                {isShow && (
                  <span className="episodes">
                    {movie.number_of_seasons} Sezon, {movie.number_of_episodes} Bölüm
                  </span>
                )}
                <span className="rating">
                  %{Math.round(movie.vote_average * 10)} Beğeni
                </span>
              </div>
              <div className="genres">
                {movie.genres.map(genre => (
                  <span key={genre.id} className="genre">
                    {genre.name}
                  </span>
                ))}
              </div>
              <p className="overview">{movie.overview}</p>
              <div className="credits">
                {movie.director && (
                  <div className="credit-item">
                    <h3>Yönetmen</h3>
                    <p>{movie.director.name}</p>
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div className="credit-item">
                    <h3>Oyuncular</h3>
                    <p>{movie.cast.map(actor => actor.name).join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="movie-reviews">
        <h2>Yorumlar ve Değerlendirmeler</h2>
        
        {user ? (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <div className="rating-input">
              <label>Puanınız:</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: parseFloat(e.target.value) })}
              />
            </div>
            <div className="review-input">
              <label>Yorumunuz:</label>
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                required
                placeholder="Film hakkında düşüncelerinizi yazın..."
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="submit-review">Yorumu Gönder</button>
          </form>
        ) : (
          <div className="login-prompt">
            Yorum yapmak için <a href="/giris">giriş yapın</a>
          </div>
        )}

        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <span className="review-author">{review.user.username}</span>
                  <span className="review-rating">★ {review.rating}</span>
                </div>
                <p className="review-content">{review.content}</p>
              </div>
            ))
          ) : (
            <p className="no-reviews">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
          )}
        </div>
      </div>
      
      {movie.similar_movies && movie.similar_movies.length > 0 && (
        <div className="similar-movies">
          <h2>Benzer İçerikler</h2>
          <MovieGrid movies={movie.similar_movies} isShow={isShow} />
        </div>
      )}
    </div>
  );
};

export default MovieDetailPage; 
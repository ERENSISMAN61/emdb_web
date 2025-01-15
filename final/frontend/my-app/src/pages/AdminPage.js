import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPage.css';

const AdminPage = () => {
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMoviePage, setCurrentMoviePage] = useState(0);
  const [currentTvShowPage, setCurrentTvShowPage] = useState(0);
  const itemsPerPage = 5;
  const [newContent, setNewContent] = useState({
    title: '',
    overview: '',
    release_date: '',
    poster_path: '',
    tmdb_id: '',
    vote_average: '',
    vote_count: '',
    popularity: '',
    contentType: 'movie'
  });

  useEffect(() => {
    Promise.all([
      fetchMovies(),
      fetchTvShows()
    ]).then(() => setLoading(false));
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/movies');
      setMovies(response.data.data);
    } catch (error) {
      console.error('Filmler yüklenirken hata:', error);
    }
  };

  const fetchTvShows = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/tv-shows');
      setTvShows(response.data.data);
    } catch (error) {
      console.error('Diziler yüklenirken hata:', error);
    }
  };

  const handleDeleteContent = async (id, type) => {
    if (window.confirm(`Bu ${type === 'movie' ? 'filmi' : 'diziyi'} silmek istediğinize emin misiniz?`)) {
      try {
        const endpoint = type === 'movie' ? 'movies' : 'tv-shows';
        await axios.delete(`http://localhost:8080/api/${endpoint}/${id}`);
        
        if (type === 'movie') {
          setMovies(movies.filter(movie => movie.id !== id));
        } else {
          setTvShows(tvShows.filter(show => show.id !== id));
        }
        
        alert(`${type === 'movie' ? 'Film' : 'Dizi'} başarıyla silindi!`);
      } catch (error) {
        console.error('İçerik silinirken hata:', error);
        alert('İçerik silinirken bir hata oluştu');
      }
    }
  };

  const handleInputChange = (e) => {
    setNewContent({
      ...newContent,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = newContent.contentType === 'movie' ? 'movies' : 'tv-shows';
      const response = await axios.post(`http://localhost:8080/api/${endpoint}`, {
        data: {
          title: newContent.title,
          overview: newContent.overview,
          release_date: newContent.release_date,
          poster_path: newContent.poster_path,
          tmdb_id: parseInt(newContent.tmdb_id),
          vote_average: parseFloat(newContent.vote_average),
          vote_count: parseInt(newContent.vote_count),
          popularity: parseFloat(newContent.popularity),
          publishedAt: new Date()
        }
      });

      if (response.data) {
        alert(`${newContent.contentType === 'movie' ? 'Film' : 'Dizi'} başarıyla eklendi!`);
        
        if (newContent.contentType === 'movie') {
          setMovies([...movies, response.data.data]);
        } else {
          setTvShows([...tvShows, response.data.data]);
        }
        
        setNewContent({
          title: '',
          overview: '',
          release_date: '',
          poster_path: '',
          tmdb_id: '',
          vote_average: '',
          vote_count: '',
          popularity: '',
          contentType: 'movie'
        });
      }
    } catch (error) {
      console.error('İçerik eklenirken hata:', error);
      alert('İçerik eklenirken bir hata oluştu');
    }
  };

  const handleNextPage = (type) => {
    if (type === 'movie') {
      const maxPage = Math.ceil(movies.length / itemsPerPage) - 1;
      setCurrentMoviePage(prev => prev < maxPage ? prev + 1 : prev);
    } else {
      const maxPage = Math.ceil(tvShows.length / itemsPerPage) - 1;
      setCurrentTvShowPage(prev => prev < maxPage ? prev + 1 : prev);
    }
  };

  const handlePrevPage = (type) => {
    if (type === 'movie') {
      setCurrentMoviePage(prev => prev > 0 ? prev - 1 : prev);
    } else {
      setCurrentTvShowPage(prev => prev > 0 ? prev - 1 : prev);
    }
  };

  const getCurrentItems = (items, currentPage) => {
    const start = currentPage * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  const handleViewReviews = () => {
    window.open('/reviews', '_blank');
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Paneli</h1>
        <p>Film/Dizi ekle, sil ve yorumları görüntüle</p>
      </div>

      <div className="admin-content">
        <div className="admin-section">
          <h2>Yeni Film/Dizi Ekle</h2>
          <form onSubmit={handleSubmit} className="content-form">
            <select 
              name="contentType" 
              value={newContent.contentType}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="movie">Film</option>
              <option value="tv-show">Dizi</option>
            </select>

            <input
              type="text"
              name="title"
              placeholder="Başlık"
              value={newContent.title}
              onChange={handleInputChange}
              required
            />

            <textarea
              name="overview"
              placeholder="Açıklama"
              value={newContent.overview}
              onChange={handleInputChange}
              required
            />

            <input
              type="date"
              name="release_date"
              value={newContent.release_date}
              onChange={handleInputChange}
              required
            />

            <input
              type="text"
              name="poster_path"
              placeholder="Poster URL"
              value={newContent.poster_path}
              onChange={handleInputChange}
              required
            />

            <input
              type="number"
              name="tmdb_id"
              placeholder="TMDB ID"
              value={newContent.tmdb_id}
              onChange={handleInputChange}
              required
            />

            <input
              type="number"
              step="0.1"
              name="vote_average"
              placeholder="Puan Ortalaması"
              value={newContent.vote_average}
              onChange={handleInputChange}
              required
            />

            <input
              type="number"
              name="vote_count"
              placeholder="Oy Sayısı"
              value={newContent.vote_count}
              onChange={handleInputChange}
              required
            />

            <input
              type="number"
              step="0.1"
              name="popularity"
              placeholder="Popülerlik"
              value={newContent.popularity}
              onChange={handleInputChange}
              required
            />

            <button type="submit" className="submit-button">
              {newContent.contentType === 'movie' ? 'Film' : 'Dizi'} Ekle
            </button>
          </form>
        </div>

        <div className="admin-section">
          <h2>Filmler ve Diziler</h2>
          <div className="content-list">
            <div className="content-section">
              <h3>Filmler</h3>
              <div className="content-slider">
                <button 
                  className="slider-button prev" 
                  onClick={() => handlePrevPage('movie')}
                  disabled={currentMoviePage === 0}
                >
                  &#8592;
                </button>
                <div className="content-grid">
                  {getCurrentItems(movies, currentMoviePage).map(movie => (
                    <div key={movie.id} className="content-item">
                      <img src={movie.poster_path} alt={movie.title} className="content-poster" />
                      <div className="content-info">
                        <h4>{movie.title}</h4>
                        <button
                          onClick={() => handleDeleteContent(movie.id, 'movie')}
                          className="delete-button"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  className="slider-button next" 
                  onClick={() => handleNextPage('movie')}
                  disabled={currentMoviePage >= Math.ceil(movies.length / itemsPerPage) - 1}
                >
                  &#8594;
                </button>
              </div>
            </div>

            <div className="content-section">
              <h3>Diziler</h3>
              <div className="content-slider">
                <button 
                  className="slider-button prev" 
                  onClick={() => handlePrevPage('tv-show')}
                  disabled={currentTvShowPage === 0}
                >
                  &#8592;
                </button>
                <div className="content-grid">
                  {getCurrentItems(tvShows, currentTvShowPage).map(show => (
                    <div key={show.id} className="content-item">
                      <img src={show.poster_path} alt={show.title} className="content-poster" />
                      <div className="content-info">
                        <h4>{show.title}</h4>
                        <button
                          onClick={() => handleDeleteContent(show.id, 'tv-show')}
                          className="delete-button"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  className="slider-button next" 
                  onClick={() => handleNextPage('tv-show')}
                  disabled={currentTvShowPage >= Math.ceil(tvShows.length / itemsPerPage) - 1}
                >
                  &#8594;
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-section">
          <h2>Yorumlar</h2>
          <button onClick={handleViewReviews} className="view-reviews-button">
            Yorumları Görüntüle
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 
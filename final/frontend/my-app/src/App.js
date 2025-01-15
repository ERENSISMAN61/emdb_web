import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieGrid from './components/MovieGrid';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MoviesPage from './pages/MoviesPage';
import TvShowsPage from './pages/TvShowsPage';
import MovieDetailPage from './pages/MovieDetailPage';
import AdminPage from './pages/AdminPage';
import ReviewsPage from './pages/ReviewsPage';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesResponse, tvShowsResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/movies'),
          axios.get('http://localhost:8080/api/tv-shows')
        ]);

        if (moviesResponse.data && moviesResponse.data.data) {
          setMovies(moviesResponse.data.data);
        }
        
        if (tvShowsResponse.data && tvShowsResponse.data.data) {
          setTvShows(tvShowsResponse.data.data);
        }
      } catch (error) {
        console.error('Veriler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              {loading ? (
                <div className="loading">Yükleniyor...</div>
              ) : (
                <>
                  <h2 className="section-title">Popüler Filmler</h2>
                  <MovieGrid movies={movies.slice(0, 10)} />
                  <h2 className="section-title">Popüler Diziler</h2>
                  <MovieGrid movies={tvShows.slice(0, 10)} isShow={true} />
                </>
              )}
            </>
          } />
          <Route path="/filmler" element={<MoviesPage />} />
          <Route path="/diziler" element={<TvShowsPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/tv-show/:id" element={<MovieDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/giris" element={<LoginPage />} />
          <Route path="/kayit" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      console.log('Loaded user data:', userData);
      console.log('User role:', userData.role);
      console.log('Is admin check:', userData.role?.type === 'admin');
      setUser(userData);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  const isAdmin = Boolean(user?.role?.type === 'admin');
  console.log('Final admin check:', isAdmin);

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">EMDB</Link>
      </div>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          id="search-input"
          name="search"
          placeholder="Film veya dizi ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" id="search-button" name="search-button" className="search-button">
          Ara
        </button>
      </form>
      <div className="nav-links">
        <Link to="/filmler">Filmler</Link>
        <Link to="/diziler">Diziler</Link>
        {isAdmin && (
          <Link to="/admin" className="admin-link">Admin Paneli</Link>
        )}
        {user ? (
          <>
            <span className="username">{user.username}</span>
            <button onClick={handleLogout} className="logout-btn">Çıkış Yap</button>
          </>
        ) : (
          <>
            <Link to="/giris">Giriş Yap</Link>
            <Link to="/kayit">Kayıt Ol</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

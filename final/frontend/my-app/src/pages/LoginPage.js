import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginResponse = await axios.post('http://localhost:8080/api/auth/local', {
        identifier: formData.identifier,
        password: formData.password
      });

      if (loginResponse.data.jwt) {
        localStorage.setItem('token', loginResponse.data.jwt);
        
        const userResponse = await axios.get('http://localhost:8080/api/users/me?populate=role', {
          headers: {
            Authorization: `Bearer ${loginResponse.data.jwt}`
          }
        });

        localStorage.setItem('user', JSON.stringify(userResponse.data));
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message;
      if (errorMessage === 'Invalid identifier or password') {
        setError('Kullanıcı adı veya şifre hatalı');
      } else {
        setError(errorMessage || 'Giriş yapılırken bir hata oluştu');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Giriş Yap</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">E-posta veya Kullanıcı Adı</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <p className="auth-link">
          Hesabın yok mu? <Link to="/kayit">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 
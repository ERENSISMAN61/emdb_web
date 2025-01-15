import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReviewsPage.css';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/reviews/all');
      if (response.data && response.data.data) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:8080/api/reviews/${reviewId}`);
        setReviews(reviews.filter(review => review.id !== reviewId));
      } catch (error) {
        console.error('Yorum silinirken hata:', error);
        alert('Yorum silinirken bir hata oluştu');
      }
    }
  };

  if (loading) {
    return <div className="reviews-loading">Yükleniyor...</div>;
  }

  return (
    <div className="reviews-page">
      <div className="reviews-header">
        <h1>Tüm Yorumlar</h1>
      </div>
      <div className="reviews-container">
        {reviews.map((review) => (
          <div key={review.id} className="review-row">
            <div className="review-content">
              {review.attributes.content}
            </div>
            <div className="review-info">
              <span className="review-rating">Puan: {review.attributes.rating}</span>
              <span className="review-user">
                Kullanıcı: {review.attributes.user.data?.attributes.username || 'Anonim'}
              </span>
              <button 
                onClick={() => handleDeleteReview(review.id)}
                className="delete-button"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage; 
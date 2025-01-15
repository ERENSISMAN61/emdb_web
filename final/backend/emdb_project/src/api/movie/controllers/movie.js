'use strict';

/**
 * movie controller
 */

const axios = require('axios');
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::movie.movie', ({ strapi }) => ({
  async find(ctx) {
    try {
      const apiKey = process.env.TMDB_API_KEY;
      const totalPages = 10; // 20 film/sayfa * 10 sayfa = 200 film
      const allMovies = [];

      const requests = Array.from({ length: totalPages }, (_, i) => 
        axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=tr-TR&page=${i + 1}`)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        if (response.data && response.data.results) {
          const movies = response.data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            type: 'movie'
          }));
          allMovies.push(...movies);
        }
      });

      return {
        data: allMovies,
        meta: {
          total: allMovies.length
        }
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const apiKey = process.env.TMDB_API_KEY;

      // TMDB'den film detaylarını al
      const movieResponse = await axios.get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=tr-TR`
      );

      const movie = movieResponse.data;

      // Veritabanında TMDB ID'ye göre ara
      const existingMovie = await strapi.entityService.findMany('api::movie.movie', {
        filters: { tmdb_id: movie.id },
      });

      // Eğer film veritabanında yoksa kaydet
      if (!existingMovie.length) {
        await strapi.entityService.create('api::movie.movie', {
          data: {
            title: movie.title,
            overview: movie.overview || 'Bu film için açıklama mevcut değil.',
            release_date: movie.release_date || null,
            poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
            tmdb_id: movie.id,
            vote_average: movie.vote_average || 0,
            vote_count: movie.vote_count || 0,
            popularity: movie.popularity || 0,
            publishedAt: new Date()
          },
        });
      }

      // Film kredilerini al (oyuncular, yönetmen vb.)
      const creditsResponse = await axios.get(
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}&language=tr-TR`
      );

      // Benzer filmleri al
      const similarResponse = await axios.get(
        `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${apiKey}&language=tr-TR&page=1`
      );

      const credits = creditsResponse.data;
      const similar = similarResponse.data;

      // Yönetmeni bul
      const director = credits.crew.find(person => person.job === 'Director');

      // Ana oyuncuları al (ilk 5)
      const cast = credits.cast.slice(0, 5);

      // Benzer filmleri formatla
      const similarMovies = similar.results.slice(0, 6).map(movie => ({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        vote_average: movie.vote_average
      }));

      return {
        data: {
          id: movie.id,
          title: movie.title,
          original_title: movie.original_title,
          overview: movie.overview,
          poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          release_date: movie.release_date,
          runtime: movie.runtime,
          genres: movie.genres,
          director: director ? {
            id: director.id,
            name: director.name
          } : null,
          cast: cast.map(actor => ({
            id: actor.id,
            name: actor.name,
            character: actor.character,
            profile_path: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null
          })),
          similar_movies: similarMovies
        }
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;
      
      // İlgili yorumları bul
      const reviews = await strapi.entityService.findMany('api::review.review', {
        filters: { movieId: id }
      });
      
      // Yorumları tek tek sil
      for (const review of reviews) {
        await strapi.entityService.delete('api::review.review', review.id);
      }
      
      // Filmi sil
      const movie = await strapi.entityService.delete('api::movie.movie', id);
      
      return { data: movie };
    } catch (error) {
      ctx.throw(500, error);
    }
  }
}));

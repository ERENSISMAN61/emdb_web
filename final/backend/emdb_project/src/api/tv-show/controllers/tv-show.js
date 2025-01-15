'use strict';

const axios = require('axios');
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::tv-show.tv-show', ({ strapi }) => ({
  async find(ctx) {
    try {
      const apiKey = process.env.TMDB_API_KEY;
      const totalPages = 10; // 20 dizi/sayfa * 10 sayfa = 200 dizi
      const allShows = [];

      const requests = Array.from({ length: totalPages }, (_, i) => 
        axios.get(`https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=tr-TR&page=${i + 1}`)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        if (response.data && response.data.results) {
          const shows = response.data.results.map(show => ({
            id: show.id,
            title: show.name,
            overview: show.overview,
            poster_path: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
            backdrop_path: show.backdrop_path ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` : null,
            vote_average: show.vote_average,
            first_air_date: show.first_air_date
          }));
          allShows.push(...shows);
        }
      });

      return {
        data: allShows,
        meta: {
          total: allShows.length
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

      // TMDB'den dizi detaylarını al
      const showResponse = await axios.get(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=tr-TR`
      );

      const show = showResponse.data;

      // Veritabanında TMDB ID'ye göre ara
      const existingShow = await strapi.entityService.findMany('api::tv-show.tv-show', {
        filters: { tmdb_id: show.id },
      });

      // Eğer dizi veritabanında yoksa kaydet
      if (!existingShow.length) {
        await strapi.entityService.create('api::tv-show.tv-show', {
          data: {
            title: show.name,
            overview: show.overview || 'Bu dizi için açıklama mevcut değil.',
            first_air_date: show.first_air_date || null,
            poster_path: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
            backdrop_path: show.backdrop_path ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` : null,
            tmdb_id: show.id,
            vote_average: show.vote_average || 0,
            vote_count: show.vote_count || 0,
            popularity: show.popularity || 0,
            number_of_seasons: show.number_of_seasons || 0,
            number_of_episodes: show.number_of_episodes || 0,
            publishedAt: new Date()
          },
        });
      }

      // Dizi kredilerini al (oyuncular, yaratıcılar vb.)
      const creditsResponse = await axios.get(
        `https://api.themoviedb.org/3/tv/${id}/credits?api_key=${apiKey}&language=tr-TR`
      );

      // Benzer dizileri al
      const similarResponse = await axios.get(
        `https://api.themoviedb.org/3/tv/${id}/similar?api_key=${apiKey}&language=tr-TR&page=1`
      );

      const credits = creditsResponse.data;
      const similar = similarResponse.data;

      // Yaratıcıları bul
      const creators = show.created_by || [];

      // Ana oyuncuları al (ilk 5)
      const cast = credits.cast.slice(0, 5);

      // Benzer dizileri formatla
      const similarShows = similar.results.slice(0, 6).map(show => ({
        id: show.id,
        title: show.name,
        poster_path: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        vote_average: show.vote_average
      }));

      return {
        data: {
          id: show.id,
          title: show.name,
          original_title: show.original_name,
          overview: show.overview,
          poster_path: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
          backdrop_path: show.backdrop_path ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` : null,
          vote_average: show.vote_average,
          vote_count: show.vote_count,
          first_air_date: show.first_air_date,
          number_of_seasons: show.number_of_seasons,
          number_of_episodes: show.number_of_episodes,
          genres: show.genres,
          creators: creators.map(creator => ({
            id: creator.id,
            name: creator.name
          })),
          cast: cast.map(actor => ({
            id: actor.id,
            name: actor.name,
            character: actor.character,
            profile_path: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null
          })),
          similar_movies: similarShows
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
        filters: { tvShowId: id }
      });
      
      // Yorumları tek tek sil
      for (const review of reviews) {
        await strapi.entityService.delete('api::review.review', review.id);
      }
      
      // Diziyi sil
      const tvShow = await strapi.entityService.delete('api::tv-show.tv-show', id);
      
      return { data: tvShow };
    } catch (error) {
      ctx.throw(500, error);
    }
  }
})); 
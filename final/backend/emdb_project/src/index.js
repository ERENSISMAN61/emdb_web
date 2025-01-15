'use strict';

const axios = require('axios');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    try {
      console.log('Popüler filmler yükleniyor...');
      await strapi.service('api::tmdb.tmdb').fetchPopularMovies();
      console.log('Popüler filmler başarıyla yüklendi!');

      console.log('Popüler diziler yükleniyor...');
      const apiKey = process.env.TMDB_API_KEY;
      const totalPages = 10; // 20 dizi/sayfa * 10 sayfa = 200 dizi

      for (let page = 1; page <= totalPages; page++) {
        const response = await axios.get(`https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=tr-TR&page=${page}`);
        
        if (response.data && response.data.results) {
          for (const show of response.data.results) {
            const existingShow = await strapi.entityService.findMany('api::tv-show.tv-show', {
              filters: { tmdb_id: show.id },
            });

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
                  publishedAt: new Date()
                },
              });
              console.log(`Dizi eklendi: ${show.name}`);
            }
          }
        }

        // API rate limit'e takılmamak için kısa bir bekleme
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log('Popüler diziler başarıyla yüklendi!');
    } catch (error) {
      console.error('Popüler içerikler yüklenirken hata:', error.message);
    }
  },
};

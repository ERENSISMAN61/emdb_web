module.exports = {
  async search(ctx) {
    try {
      const { query } = ctx.query;
      
      if (!query) {
        return ctx.badRequest('Arama terimi gerekli');
      }

      const movies = await strapi.service('api::tmdb.tmdb').fetchAndSaveMovies(query);
      
      if (movies && Array.isArray(movies)) {
        console.log('Bulunan filmler:', movies.length);
        return {
          data: movies.map(movie => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            release_date: movie.release_date,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            popularity: movie.popularity
          }))
        };
      }
      
      return { data: [] };
    } catch (error) {
      console.error('Arama hatası:', error);
      return ctx.badRequest(error.message);
    }
  },
};

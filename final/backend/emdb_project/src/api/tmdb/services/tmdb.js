'use strict';

const axios = require('axios');

module.exports = {
  async fetchAndSaveMovies(query) {
    console.log('fetchAndSaveMovies çağrıldı:', query);

    const apiKey = process.env.TMDB_API_KEY;
    const accessToken = process.env.TMDB_ACCESS_TOKEN;
    const baseUrl = 'https://api.themoviedb.org/3';

    try {
      // Önce veritabanında ara
      const existingMovies = await strapi.entityService.findMany('api::movie.movie', {
        filters: {
          title: {
            $containsi: query
          }
        }
      });

      const dbMovies = existingMovies.map(movie => ({
        id: movie.tmdb_id,
        title: movie.title,
        overview: movie.overview,
        release_date: movie.release_date,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        popularity: movie.popularity,
        type: 'movie'
      }));

      // TMDB'den ara
      console.log('TMDB API çağrısı başlatılıyor...');
      const response = await axios.get(`${baseUrl}/search/movie`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          api_key: apiKey,
          query: query,
          language: 'tr-TR'
        },
      });

      const movies = response.data.results;
      console.log('TMDB API yanıtı alındı:', movies);

      const savedMovies = [];

      for (const movie of movies) {
        console.log('Film kontrol ediliyor:', movie.title);

        const existingMovie = await strapi.entityService.findMany('api::movie.movie', {
          filters: { tmdb_id: movie.id },
        });

        let movieData;

        if (!existingMovie.length) {
          console.log('Yeni film kaydediliyor:', movie.title);

          // Film detaylarını al
          const detailResponse = await axios.get(`${baseUrl}/movie/${movie.id}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              api_key: apiKey,
              language: 'tr-TR'
            },
          });

          const movieDetail = detailResponse.data;

          movieData = await strapi.entityService.create('api::movie.movie', {
            data: {
              title: movie.title,
              overview: movie.overview || movieDetail.overview || 'Bu film için açıklama mevcut değil.',
              release_date: movie.release_date || null,
              poster_path: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null,
              backdrop_path: movie.backdrop_path
                ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                : null,
              tmdb_id: movie.id,
              vote_average: movie.vote_average || 0,
              vote_count: movie.vote_count || 0,
              popularity: movie.popularity || 0,
              publishedAt: new Date()
            },
          });

          console.log('Film başarıyla kaydedildi:', movie.title);
        } else {
          console.log('Film zaten mevcut:', movie.title);
          movieData = existingMovie[0];
        }

        savedMovies.push({
          id: movieData.tmdb_id,
          title: movieData.title,
          overview: movieData.overview,
          release_date: movieData.release_date,
          poster_path: movieData.poster_path,
          vote_average: movieData.vote_average,
          vote_count: movieData.vote_count,
          popularity: movieData.popularity,
          type: 'movie'
        });
      }

      // Veritabanı ve TMDB sonuçlarını birleştir
      const allMovies = [...dbMovies, ...savedMovies];
      
      // Tekrarlanan sonuçları filtrele (tmdb_id'ye göre)
      const uniqueMovies = Array.from(new Map(allMovies.map(movie => [movie.id, movie])).values());
      
      // Popülerliğe göre sırala
      uniqueMovies.sort((a, b) => b.popularity - a.popularity);

      return uniqueMovies;
    } catch (error) {
      console.error('TMDB API Hatası:', error.response?.data || error.message);
      throw new Error('TMDB API isteği başarısız oldu.');
    }
  },

  async fetchPopularMovies() {
    const apiKey = process.env.TMDB_API_KEY;
    const accessToken = process.env.TMDB_ACCESS_TOKEN;
    const baseUrl = 'https://api.themoviedb.org/3';

    try {
      console.log('Popüler filmler getiriliyor...');
      let allMovies = [];
      
      // 200 film için 10 sayfa çekilecek (her sayfada 20 film)
      for (let page = 1; page <= 10; page++) {
        const response = await axios.get(`${baseUrl}/movie/popular`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            api_key: apiKey,
            page: page,
            language: 'tr-TR'
          },
        });

        const movies = response.data.results;
        console.log(`Sayfa ${page} alındı, ${movies.length} film bulundu`);

        for (const movie of movies) {
          const existingMovie = await strapi.entityService.findMany('api::movie.movie', {
            filters: { tmdb_id: movie.id },
          });

          if (!existingMovie.length) {
            console.log('Yeni popüler film ekleniyor:', movie.title);

            // Detaylı film bilgisini al
            const detailResponse = await axios.get(`${baseUrl}/movie/${movie.id}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              params: {
                api_key: apiKey,
                language: 'tr-TR'
              },
            });

            const movieDetail = detailResponse.data;

            await strapi.entityService.create('api::movie.movie', {
              data: {
                title: movie.title,
                overview: movie.overview || movieDetail.overview || 'Bu film için açıklama mevcut değil.',
                release_date: movie.release_date || null,
                poster_path: movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : null,
                backdrop_path: movie.backdrop_path
                  ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                  : null,
                tmdb_id: movie.id,
                vote_average: movie.vote_average || 0,
                vote_count: movie.vote_count || 0,
                popularity: movie.popularity || 0,
                publishedAt: new Date()
              },
            });

            console.log('Film başarıyla kaydedildi:', movie.title);
          } else {
            console.log('Film zaten mevcut:', movie.title);
          }
        }

        // API rate limit'e takılmamak için kısa bir bekleme
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return { success: true, message: 'Popüler filmler başarıyla eklendi' };
    } catch (error) {
      console.error('Popüler filmler getirilirken hata:', error.response?.data || error.message);
      throw new Error('Popüler filmler getirilemedi');
    }
  },
};

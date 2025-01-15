'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::review.review', ({ strapi }) => ({
  async find(ctx) {
    const query = ctx.query || {};
    const filters = query.filters || {};
    
    // @ts-ignore
    const movieId = filters.movieId;
    // @ts-ignore
    const tvShowId = filters.tvShowId;

    if (!movieId && !tvShowId) {
      return ctx.badRequest('Film ID veya Dizi ID\'si gerekli');
    }

    const queryFilters = {};
    if (movieId) {
      queryFilters.movieId = movieId;
    } else if (tvShowId) {
      queryFilters.tvShowId = tvShowId;
    }

    const reviews = await strapi.entityService.findMany('api::review.review', {
      filters: queryFilters,
      populate: ['user']
    });

    return { data: reviews };
  },

  async findAll(ctx) {
    try {
      const reviews = await strapi.entityService.findMany('api::review.review', {
        populate: ['user']
      });

      const formattedReviews = reviews.map(review => {
        // @ts-ignore
        const userData = review.user ? {
          // @ts-ignore
          id: review.user.id,
          attributes: {
            // @ts-ignore
            username: review.user.username
          }
        } : null;

        return {
          id: review.id,
          attributes: {
            content: review.content,
            rating: review.rating,
            movieId: review.movieId,
            tvShowId: review.tvShowId,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            user: {
              data: userData
            }
          }
        };
      });

      return { data: formattedReviews };
    } catch (error) {
      console.error('Yorumlar getirilirken hata:', error);
      return ctx.internalServerError('Yorumlar getirilemedi');
    }
  },

  async create(ctx) {
    const data = ctx.request.body && ctx.request.body.data;
    if (!data) {
      return ctx.badRequest('Geçersiz veri formatı');
    }

    const { content, rating, movieId, tvShowId, user } = data;

    if (!content || !rating || (!movieId && !tvShowId) || !user) {
      return ctx.badRequest('Eksik veya hatalı bilgi');
    }

    const review = await strapi.entityService.create('api::review.review', {
      data: {
        content,
        rating: parseInt(rating),
        movieId: movieId ? parseInt(movieId) : null,
        tvShowId: tvShowId ? parseInt(tvShowId) : null,
        user
      },
      populate: ['user']
    });

    return { data: review };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    
    const review = await strapi.entityService.delete('api::review.review', id);
    
    return { data: review };
  }
})); 
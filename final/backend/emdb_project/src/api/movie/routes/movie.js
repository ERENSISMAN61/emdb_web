'use strict';

/**
 * movie router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/movies',
      handler: 'movie.find',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/movies/:id',
      handler: 'movie.findOne',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/movies',
      handler: 'movie.create',
      config: {
        auth: false
      }
    },
    {
      method: 'DELETE',
      path: '/movies/:id',
      handler: 'movie.delete',
      config: {
        auth: false
      }
    }
  ]
};

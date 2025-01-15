'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/tv-shows',
      handler: 'tv-show.find',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/tv-shows/:id',
      handler: 'tv-show.findOne',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/tv-shows',
      handler: 'tv-show.create',
      config: {
        auth: false
      }
    },
    {
      method: 'DELETE',
      path: '/tv-shows/:id',
      handler: 'tv-show.delete',
      config: {
        auth: false
      }
    }
  ]
}; 
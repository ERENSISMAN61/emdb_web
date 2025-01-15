'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/reviews',
      handler: 'review.find',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/reviews/all',
      handler: 'review.findAll',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/reviews',
      handler: 'review.create',
      config: {
        auth: false
      }
    },
    {
      method: 'DELETE',
      path: '/reviews/:id',
      handler: 'review.delete',
      config: {
        auth: false
      }
    }
  ]
}; 
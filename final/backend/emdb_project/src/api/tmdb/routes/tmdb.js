module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/tmdb/search',
      handler: 'tmdb.search',
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};

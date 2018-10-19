'use strict';
module.exports = function(app) {
  var depFetcher = require('../controllers/depFetcherController');

  // depFetcher Routes
  app.route('/')
    .get(depFetcher.emptyGreet);

  app.route('/fetch/:package&:version')
    .get(depFetcher.fetchPackage);

  app.route('*')
    .get(depFetcher.badRouteGreet);
};

var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'instaplan'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://admin2:admin@ds133211.mlab.com:33211/nomadcouples'
  },

  test: {
    root: rootPath,
    app: {
      name: 'instaplan'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://admin2:admin@ds133211.mlab.com:33211/nomadcouples'
  },

  production: {
    root: rootPath,
    app: {
      name: 'instaplan'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://admin2:admin@ds133211.mlab.com:33211/nomadcouples'
  }
};

module.exports = config[env];

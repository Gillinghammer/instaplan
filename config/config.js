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
    db: 'mongodb://localhost/instaplan-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'instaplan'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/instaplan-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'instaplan'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/instaplan-production'
  }
};

module.exports = config[env];

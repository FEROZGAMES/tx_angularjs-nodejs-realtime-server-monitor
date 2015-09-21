'use strict';

module.exports = {
  env: 'production', // 'development' or 'production'
  production:{
    hostHTTP: '172.16.202.48',
    portHTTP: 64500,
    dbConnect: 'mongodb://172.16.200.30:27017/registers',
    apiURLddbb: '/api'
  },
  development:{
    hostHTTP: 'localhost',
    portHTTP: 80,
    dbConnect: 'mongodb://localhost:27017/localhostDB',
    apiURLddbb: '/yourApiUrl'
  },
  adminRoom: 'adminGraf'
};

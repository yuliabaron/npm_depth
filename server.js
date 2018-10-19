'use strict';
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({secret: 'npm_secret', resave: true, saveUninitialized: true}));

var routes = require('./api/routes/depFetcherRoutes'); // importing route
routes(app); // register the route

var server = app.listen(port, function() {
  console.log('We are live on ' + port);
});

server.on('close', function() {
  console.log('Closing')
});

module.exports = server;

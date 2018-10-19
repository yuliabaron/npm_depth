'use strict';
var https = require('https');
var events = require('events');
var semver = require('semver');
var logger = require('../logger');

var eventEmitter = new events.EventEmitter();
// Package map will be mapping of the package (name_version) to the json
// representing its dependencies. It's global for server and thus can be
// accessed from several requests
var packageMapCache = {};

// Static vars
var baseNPMRegURL = 'https://registry.npmjs.org/';
var LATEST = 'latest';

// This function queries NPM REST API for the dependencies list and emits event
// upon completion
function getFromRep(req, name, ver, res){
  var url = baseNPMRegURL + name + '/' + ver;

  https.get(url.toString(), function(responce) {
    var data = '';

    // A chunk of data has been received
    responce.on('data', function(chunk) {
      data += chunk;
    });

    // The whole response has been received. Save to the cache and emit event
    responce.on('end', function() {
      var parsedData = JSON.parse(data);
      var localVersion = '';

      // In case the query was for the LATEST version - save the real version
      if (ver !== LATEST)
        localVersion = ver;
      else
        localVersion = parsedData.version;

      var localKey = name + '_' + localVersion;
      var localDeps = parsedData.dependencies;
      if (!localDeps)
        localDeps = {};
      packageMapCache[localKey] = localDeps;
      eventEmitter.emit('depCache', req, name, localVersion, res);
    });

  }).on('error', function(err) {
    console.log('Error: ' + err.message);
    res.send(err);
    res.session.endSent = true;
  });
}

// depCache handler
// It sends dependencies list for the given package, and initiates next level
// queries
var fetcherHandler = function fHandler(req, name, version, res) {
  var key = name + '_' + version;
  var session = req.session;

  if (packageMapCache[key]) {
    var deps = packageMapCache[key];

    var obj = {};
    obj[name + ':' + version] = deps;
    if (!session.isFirst)
      res.write(',');
    else
      session.isFirst = false;
    res.write(JSON.stringify(obj));

    // Increase the queue count by the number of dependencies
    // And go over the dependencies and fetch their dep tree
    session.queueCount += Object.keys(deps).length;
    for (var elem in deps){
      var ver = semver.coerce(deps[elem]);
      fetcher(req, elem, ver, res);
    }

    // Finished treating the key, decrease the queue count
    session.queueCount--;

    // Finalize the response.
    // If one of the packages' queries produced an error - do not send end
    if (session.queueCount === 0 && !session.endSent) {
      res.end(']');
    }
  }
};

eventEmitter.on('depCache', fetcherHandler);

// Fetching logic
function fetcher(req, name, ver, res){
  var key = name + '_' + ver;

  // Go to API call only if the package is not cached yet
  if (ver === LATEST || !packageMapCache[key]) {
    logger.log("Getting " + name + " v" + ver + "from the registry");
    getFromRep(req, name, ver, res);
  } else {
    logger.log("Getting " + name + " v" + ver + "from the cache");
    eventEmitter.emit('depCache', req, name, ver, res);
  }
}

// Routes
exports.fetchPackage = function(req, res) {
  var ver = req.params.version;
  if (ver.empty)
    ver = LATEST;

  // create session variables
  var session = req.session;
  session.queueCount = 1;
  session.isFirst = true;
  session.endSent = false;

  res.setHeader('Content-Type', 'application/json');
  res.write('[');

  fetcher(req, req.params.package, ver, res);
};

exports.emptyGreet = function(req, res) {
  res.json('Welcome to Package Dependencies Fetcher');
};

exports.badRouteGreet = function(req, res) {
  res.status(404).send(JSON.stringify({}));
};

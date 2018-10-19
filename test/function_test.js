'use strict';
var expect = require('chai').expect;
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

chai.use(chaiHttp);
//var sinon = require('mocha-sinon');

// In this test suite we do not restart the server as it is important to verify
// the cache is used
describe('Functionality testing', function() {
  var server;
  //var logStub = {
  //  log: sinon.spy(),
  //};

  //var srvLog = proxyquire('../server', {
   // 'logger': logStub
  //});

  before(function() {
    server = require('../server');
  });

  it('Verify package content for mongodb-core v3.1.7', function(done) {
    console.log('Test1 - Verify package content for mongodb-core v3.1.7');

    //Expected result
    //[{"mongodb-core:3.1.7":{"bson":"^1.1.0","require_optional":"^1.0.1",
    // "safe-buffer":"^5.1.2","saslprep":"^1.0.0"}},
    // {"bson:1.1.0":{}},
    // {"require_optional:1.0.1":{"semver":"^5.1.0","resolve-from":"^2.0.0"}},
    // {"semver:5.1.0":{}},
    // {"resolve-from:2.0.0":{}},
    // {"safe-buffer:5.1.2":{}},
    // {"saslprep:1.0.0":{}}]
    //Overall 7 elements

    chai.request(server)
      .get('/fetch/mongodb-core&3.1.7')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        if (Object.keys(res.body).length != 7)
          throw new Error("Expected 7 elements in the response, but obtained " + Object.keys(deps).length);
        done()
      });
  });

  it('Verify cache use', function(done) {
    console.log('Test2 - Verify cache use');
    chai.request(server)
      .get('/fetch/require_optional&1.0.1')
      .end(function(err, res){
        res.should.have.status(200);
        done()
      });
      // TODO - verify cache is used
  });

  it('Check \'latest\' functionality', function(done) {
    console.log('Test3 - Check \'latest\' functionality');
      // TODO - confirm query is issued for the second time as well
    chai.request(server)
      .get('/fetch/mongodb-core&latest')
      .end(function(err, res){
        res.should.have.status(200);
        done()
      });
  });
});

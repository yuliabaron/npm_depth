var request = require('supertest');
var expect = require('chai').expect;

describe('Check server routes', function () {
  var server;
  beforeEach(function () {
    delete require.cache[require.resolve('../server')];
    server = require('../server', { bustCache: true });
  });
  afterEach(function (done) {
    server.close(done);
  });
  it('responds to /', function (done) {
    console.log('Test1 - test OK status for \'/\'')
    request(server)
      .get('/')
      .expect(200, done);
  });
  it('responds to /package&version', function (done) {
    console.log('Test2 - test OK status for the real fetch')
    request(server)
      .get('/fetch/async&2.0.1')
      .expect(200, done);
  });
  it('404 everything else', function (done) {
    console.log('Test3 - test NOT FOUND status')
    request(server)
      .get('/fetch')
      .expect(404, done);
  });
});
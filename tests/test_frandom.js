require('dotenv-safe').config();

const chai = require('chai');
const chaiHttp = require('chai-http');
const randomstring = require('randomstring');
const log4js = require('log4js');
const app = require('../app');

const logger = log4js.getLogger('tests/test_web.js');

const { assert } = chai;
const { expect } = chai;

// Configure chai
chai.use(chaiHttp);
chai.should();

function assertNotError(err, res) {
  if (err) {
    logger.error(err.message);
    assert.fail(err);
  }
}

describe('Test Frandom', function () {
  this.timeout(10 * 1000);

  before(() => {
    process.env.NODE_ENV = 'test';
  });

  describe('Test landing page', () => {
    it('should get landin page', (done) => {
      chai.request(app)
        .get('/frandom')
        .end((err, res) => {
          assertNotError(err, res);
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  describe('Test companies ', () => {
    it('should get companies with default params', (done) => {
      chai.request(app)
        .get('/frandom/api/companies')
        .end((err, res) => {
          assertNotError(err, res);
          expect(res).to.have.status(200);
          assert.equal(res.header['content-type'], 'application/json; charset=utf-8');
          assert.isArray(res.body);
          assert.isAtLeast(res.body.length, 1);
          done();
        });
    });
  });

  describe('Test persons', () => {
    it('should get persons with default params', (done) => {
      chai.request(app)
        .get('/frandom/api/persons')
        .end((err, res) => {
          assertNotError(err, res);
          expect(res).to.have.status(200);
          assert.equal(res.header['content-type'], 'application/json; charset=utf-8');
          assert.isArray(res.body);
          assert.isAtLeast(res.body.length, 1);
          done();
        });
    });
  });

  describe('Test numbers', () => {
    it('should get numbers with default params', (done) => {
      chai.request(app)
        .get('/frandom/api/numbers')
        .end((err, res) => {
          assertNotError(err, res);
          expect(res).to.have.status(200);
          assert.equal(res.header['content-type'], 'application/json; charset=utf-8');
          assert.isArray(res.body);
          assert.isAtLeast(res.body.length, 1);
          done();
        });
    });
  });
});

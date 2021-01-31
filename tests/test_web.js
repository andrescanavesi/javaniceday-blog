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

describe('Test Web', function () {
  this.timeout(10 * 1000);

  before(() => {
    process.env.NODE_ENV = 'test';
  });

  it('should get home page', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        assertNotError(err, res);
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should search', (done) => {
    chai.request(app)
      .get('/search?q=nodejs')
      .end((err, res) => {
        assertNotError(err, res);
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should get seo list page', (done) => {
    chai.request(app)
      .get('/l/how-to-build-a-sitemap')
      .end((err, res) => {
        assertNotError(err, res);
        expect(res).to.have.status(200);
        done();
      });
  });

  it.skip('should display a post', (done) => {
    chai.request(app)
      .get('/post/1/from-test')
      .end((err, res) => {
        assertNotError(err, res);
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should display sitemap.xml', (done) => {
    chai.request(app)
      .get('/sitemap.xml')
      .end((err, res) => {
        assertNotError(err, res);
        expect(res).to.have.status(200);
        // expect(res).to.have.headers;
        // expect(res).to.be.all; // TODO validate xml
        done();
      });
  });

  it('should display all tags', (done) => {
    chai.request(app)
      .get('/all/tags')
      .end((err, res) => {
        assertNotError(err, res);
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should display all posts', (done) => {
    chai.request(app)
      .get('/all/posts')
      .end((err, res) => {
        assertNotError(err, res);
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should display all search terms', (done) => {
    chai.request(app)
      .get('/all/search')
      .end((err, res) => {
        assertNotError(err, res);
        expect(res).to.have.status(200);
        done();
      });
  });

  // it('should display robots.txt', (done) => {
  //   chai.request(app)
  //     .get('/robots.txt')
  //     .end((err, res) => {
  //       assertNotError(err, res);
  //       expect(res).to.have.status(200);
  //       expect(res).to.have.headers;
  //       expect(res).to.be.all; // TODO validate txt content
  //       done();
  //     });
  // });
});

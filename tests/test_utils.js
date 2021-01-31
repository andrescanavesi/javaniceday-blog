require('dotenv-safe').config();

const chai = require('chai');
const randomstring = require('randomstring');
const log4js = require('log4js');
const utils = require('../utils/utils');


const logger = log4js.getLogger('tests/test_utils.js');

const { assert } = chai;

describe('Test utils', function () {
  this.timeout(2 * 1000);

  before(() => {
    process.env.NODE_ENV = 'test';
  });

  it('should replace more than twice "-"', (done) => {
    const result = utils.dashString('my--text--- another space');
    assert.equal(result, 'my-text-another-space');
    done();
  });

  it('should deal with "(something)"', (done) => {
    const result = utils.dashString('Test Driven Development (TDD) in a nutshell');
    assert.equal(result, 'test-driven-development-tdd-in-a-nutshell');
    done();
  });
});

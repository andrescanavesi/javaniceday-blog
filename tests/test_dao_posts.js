require('dotenv-safe').config();

const chai = require('chai');
const randomstring = require('randomstring');
const log4js = require('log4js');
const daoPosts = require('../daos/dao_posts');

const logger = log4js.getLogger('tests/test_dao_posts.js');
logger.level = 'info';

const { assert } = chai;

describe('Test dao_posts', function () {
  this.timeout(10 * 1000);

  before(() => {
    process.env.NODE_ENV = 'test';
  });

  it('should exclude a given from related search', async () => {
    const post = await daoPosts.findById(1);
    const result = await daoPosts.findRelated(post.tags, post.id);
    assert.isNotNull(result);
    // logger.info(JSON.stringify(result, null, 2));
    assert.isAtLeast(result.length, 1);
    const found = result.find((item) => item.id === post.id);
    assert.isUndefined(found, `found the post ${post.id}`);
  });
});

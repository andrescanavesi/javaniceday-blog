const chai = require('chai');
const randomstring = require('randomstring');
const log4js = require('log4js');
const controllerSearchTerms = require('../controllers/controller_search_terms');
const daoSearchTerms = require('../daos/dao_search_terms');

const logger = log4js.getLogger('tests/test_controller_search_terms.js');
logger.level = 'info';

const { assert } = chai;

describe('Test controller_search_terms', function () {
  this.timeout(10 * 1000);

  const prefix = 'from-test';

  before(() => {
    // TODO
  });

  after(async () => {
    await daoSearchTerms.deleteDummyData(prefix);
  });

  it('should process a csv content', async () => {
    const csv = `Consulta,Clics,Impresiones,CTR,Posición
    ${prefix} how to build a sitemap,4,23,17.39%,7.96
    ${prefix} express sitemap,3,19,15.79%,6.42
    ${prefix} nodejs sitemap,2,18,11.11%,7.17
    ${prefix} get current user profile in lightning component,2,6,33.33%,8.83`;

    await controllerSearchTerms.processCsv(csv);

    const searchTerm = await daoSearchTerms.findByTerm('how to build a sitemap', false, false, false);
    assert.isNotNull(searchTerm);
    assert.equal(searchTerm.term_seo, 'how-to-build-a-sitemap');
  });
});

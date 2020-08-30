const csvString = require('csv-string');
const log4js = require('log4js');
const daoSearchTerms = require('../daos/dao_search_terms');

const logger = log4js.getLogger('controller_search_terms');
logger.level = 'info';

async function processRow(row) {
  if (!row) return;
  if (row.length === 0) return;
  if (!row[0]) return;
  if (!row[0].trim()) return;
  const term = row[0];
  logger.info(`[processRow] ${term}`);
  const searchTerm = await daoSearchTerms.findByTerm(term, true, false, false);
  if (!searchTerm) {
    await daoSearchTerms.insert(term);
  }
}

module.exports.processCsv = async function (csvContent) {
  logger.info('[processCsv]');
  if (!csvContent) throw new Error('empty csv content');
  let arr = csvString.parse(csvContent);
  arr = arr.splice(1, arr.length); // remove the first element that contains the header
  // eslint-disable-next-line no-restricted-syntax
  for (const item of arr) {
    // do this way instead of in parallel to detect error easier
    try {
      // eslint-disable-next-line no-await-in-loop
      await processRow(item);
    } catch (err) {
      // do not stop tje import for a specific error
      logger.error(err);
    }
  }
};

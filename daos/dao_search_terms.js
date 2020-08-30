const log4js = require('log4js');
const moment = require('moment');
const dbHelper = require('../utils/db_helper');
const utils = require('../utils/utils');

moment.locale('en');

const logger = log4js.getLogger('dao_search_terms');
logger.level = 'info';

/**
 *
 * @param {*} row
 */
function convertRow(row) {
  return {
    id: row.id,
    term: row.term,
    term_seo: row.term_seo,
    created_at: row.created_at,
    created_at_friendly: moment(row.created_at).format('MMM DD, YYYY'),
    created_at_friendly_2: moment(row.created_at).format('YYYY-MM-DD'),
    created_at_friendly_3: moment(row.created_at).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: row.updated_at,
    updated_at_friendly: moment(row.updated_at).format('MMM DD, YYYY'),
    updated_at_friendly_2: moment(row.updated_at).format('YYYY-MM-DD'),
    updated_at_friendly_3: moment(row.updated_at).format('YYYY-MM-DD HH:mm:ss'),
    active: row.active,
    related_posts_csv: row.related_posts_csv,
    url: `${process.env.JND_BASE_URL}l/${row.term_seo}`,
    featured_image_url: `${process.env.JND_DEFAULT_IMAGE_URL}`,
  };
}

/**
 *
 * @param {*} term
 * @param {*} ignoreActive false to only get active records
 * @param {*} witchCache
 * @param {*} isSeoTerm
 */
module.exports.findByTerm = async function (term, ignoreActive = false, witchCache = true, isSeoTerm = false) {
  if (!term) throw Error('term param not defined');
  logger.info(`[findByTerm] ${term}`);
  const column = isSeoTerm ? 'term_seo' : 'term';
  const query = ignoreActive
    ? `SELECT * FROM search_terms WHERE ${column} = $1 LIMIT 1`
    : `SELECT * FROM search_terms WHERE active=true AND ${column} = $1 LIMIT 1`;
  const bindings = [term.toLowerCase().trim()];

  logger.info(`[findByTerm] bindings: ${bindings}`);
  const result = await dbHelper.query(query, bindings, witchCache);
  if (result.rows.length > 0) {
    return convertRow(result.rows[0]);
  }
  return null;
};

module.exports.insert = async function (searchTerm) {
  const term = searchTerm.toLowerCase().trim();
  logger.info(`inserting search term ${term}`);
  const termSeo = utils.dashString(term);
  const today = moment().format('YYYY-MM-DD HH:mm:ss');
  const active = true;
  const relatedPosts = null;
  const query = `INSERT INTO search_terms(created_at, 
      updated_at, 
      term, 
      term_seo, 
      active, 
      related_posts_csv) 
    VALUES($1,$2,$3,$4,$5,$6) RETURNING id`;
  const bindings = [
    today,
    today,
    term,
    termSeo,
    active,
    relatedPosts,
  ];

  const result = await dbHelper.query(query, bindings, false);
  // logger.info(JSON.stringify(result, null, 2));
  const insertedId = result.rows[0].id;
  logger.info(`search term inserted: ${insertedId}`);
  return insertedId;
};

module.exports.deleteDummyData = function (prefix) {
  logger.info(`[deleteDummyData] prefix: ${prefix}`);
  const query = 'DELETE FROM search_terms WHERE term LIKE $1';
  return dbHelper.query(query, [`${prefix}%`], false);
};

module.exports.findAll = async function (ignoreActive = false, witchCache = true) {
  logger.info('[findAll]');
  const condActives = !ignoreActive ? ' WHERE active=true ' : '';
  const query = `SELECT * FROM search_terms ${condActives} ORDER BY created_at ASC LIMIT $1 `;
  const bindings = [1000];

  const result = await dbHelper.query(query, bindings, witchCache);
  logger.info(`search terms: ${result.rows.length}`);
  const posts = [];
  for (let i = 0; i < result.rows.length; i++) {
    posts.push(convertRow(result.rows[i]));
  }
  return posts;
};

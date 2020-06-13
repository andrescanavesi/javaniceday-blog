const moment = require('moment');

moment.locale('en');

const FlexSearch = require('flexsearch');
const log4js = require('log4js');
const dbHelper = require('../utils/db_helper');

const logger = log4js.getLogger('dao_posts');
logger.level = 'info';

const preset = 'fast';
const searchIndex = new FlexSearch(preset);

let allPosts = [];

/**
 *
 * @param {*} row
 */
function convertPost(row) {
  const baseImagesUrl = 'https://res.cloudinary.com/dniiru5xy/image/upload/c_scale,w_900/v1590442770/javaniceday.com/';
  const result = {
    id: row.id,
    title: row.title,
    title_seo: row.title_seo,
    created_at: row.created_at,
    created_at_friendly: moment(row.created_at).format('MMM DD, YYYY'),
    created_at_friendly_2: moment(row.created_at).format('YYYY-MM-DD'),
    created_at_friendly_3: moment(row.created_at).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: row.updated_at,
    updated_at_friendly: moment(row.updated_at).format('MMM DD, YYYY'),
    updated_at_friendly_2: moment(row.updated_at).format('YYYY-MM-DD'),
    updated_at_friendly_3: moment(row.updated_at).format('YYYY-MM-DD HH:mm:ss'),
    content: row.content,
    summary: row.summary,
    active: row.active,
    featured_image_url: baseImagesUrl + row.featured_image_name,
    tags: row.tags,
    tags_array: row.tags.split(','),
    url: `${process.env.JND_BASE_URL}post/${row.title_seo}`,
    url_edit: `${process.env.JND_BASE_URL}admin/edit/${row.id}`,
  };

  return result;
}

async function findWithLimit(limit, onlyActives = true) {
  logger.info(`findWithLimit, limit: ${limit}`);
  const condActives = onlyActives ? ' WHERE active=true ' : '';
  const query = `SELECT * FROM posts ${condActives} ORDER BY created_at DESC LIMIT $1 `;
  const bindings = [limit];

  const result = await dbHelper.query(query, bindings, true);
  logger.info(`posts: ${result.rows.length}`);
  const posts = [];
  for (let i = 0; i < result.rows.length; i++) {
    posts.push(convertPost(result.rows[i]));
  }
  return posts;
}

module.exports.resetCache = async function () {
  allPosts = [];
  await this.buildSearchIndex();
};


module.exports.findAll = async function (onlyActives = true) {
  if (allPosts.length === 0) {
    allPosts = findWithLimit(1000, onlyActives);
  }
  return allPosts;
};

/**
 *
 * @param {number} id
 * @param {boolean} ignoreActive true to find active true and false
 * @param {boolean} witchCache
 */
module.exports.findById = async function (id, ignoreActive, witchCache = true) {
  if (!id) {
    throw Error('id param not defined');
  }
  let query;
  if (ignoreActive === true) {
    query = 'SELECT * FROM posts WHERE id = $1 LIMIT 1';
  } else {
    query = 'SELECT * FROM posts WHERE active=true AND id = $1 LIMIT 1';
  }

  const bindings = [id];
  // log.info(sqlFormatter.format(query));
  logger.info(`findById, bindings: ${bindings}`);
  const result = await dbHelper.query(query, bindings, witchCache);
  if (result.rows.length > 0) {
    const post = convertPost(result.rows[0]);


    return post;
  }
  throw Error(`post not found by id ${id}`);
};

/**
 *
 * @param {number} titleSeo
 * @param {boolean} witchCache
 */
module.exports.findByTitleSeo = async function (titleSeo, witchCache = true) {
  if (!titleSeo) {
    throw Error('titleSeo param not defined');
  }
  const query = 'SELECT * FROM posts WHERE active=true AND title_seo = $1 LIMIT 1';


  const bindings = [titleSeo];
  // log.info(sqlFormatter.format(query));
  logger.info(`findByTitleSeo, bindings: ${bindings}`);
  const result = await dbHelper.query(query, bindings, witchCache);
  if (result.rows.length > 0) {
    const post = convertPost(result.rows[0]);


    return post;
  }
  throw Error(`post not found by name ${titleSeo}`);
};

/**
 *
 * @param {number} titleSeo
 * @param {boolean} witchCache
 */
module.exports.findByTag = async function (tag, witchCache = true) {
  if (!tag) {
    throw Error('tag param not defined');
  }
  const tagLike = '%tag1%';
  const bindings = [tagLike];
  const query = 'SELECT * FROM posts WHERE active=true AND tags LIKE $1 ORDER BY created_at DESC LIMIT 20';

  logger.info(`findByTag, bindings: ${bindings}`);
  const result = await dbHelper.query(query, bindings, witchCache);

  const posts = [];
  for (let i = 0; i < result.rows.length; i++) {
    posts.push(convertPost(result.rows[i]));
  }
  return posts;
};

/**
 *
 */
module.exports.findByIds = async function (ids) {
  if (!ids) {
    throw Error('ids param not defined');
  }
  logger.info('findByIds');
  // log.info(ids);
  for (let i = 0; i < ids.length; i++) {
    if (isNaN(ids[i])) {
      throw new Error(`Seems '${ids[i]}' is not a number`);
    }
  }
  // in this case we concatenate string instead of using bindings. Something to improve
  const query = `SELECT * FROM posts WHERE active=true AND id IN (${ids}) LIMIT 100`;
  const bindings = [];
  // log.info(sqlFormatter.format(query));
  // log.info("bindings: " + bindings);
  const result = await dbHelper.query(query, bindings, true);
  const posts = [];
  for (let i = 0; i < result.rows.length; i++) {
    posts.push(convertPost(result.rows[i]));
  }
  return posts;
};

module.exports.buildSearchIndex = async function () {
  // console.time('buildIndexTook');
  logger.info('building index...');

  const all = await this.findAll();

  const size = all.length;
  for (let i = 0; i < size; i++) {
    // we might concatenate the fields we want for our content
    const content = `${all[i].title} ${all[i].tags}`;
    const key = parseInt(all[i].id);
    searchIndex.add(key, content);
  }
  logger.info(`index built, length: ${searchIndex.length}`);
  // console.timeEnd('buildIndexTook');
};

/**
   * @param {string} text to search
   */
module.exports.findRelated = async function (text) {
  logger.info(`look for related results with: ${text}`);
  if (this.searchIndex.length === 0) {
    await this.buildSearchIndex();
  }

  const resultIds = await this.searchIndex.search({
    query: text,
    limit: 12,
    suggest: true, // When suggestion is enabled all results will be filled up (until limit, default 1000) with similar matches ordered by relevance.
  });

  logger.info(`related results: ${resultIds.length}`);
  let results = [];
  if (resultIds.length > 0) {
    results = await this.findByIds(resultIds);
  }

  if (results.length < 10) {
    logger.info('not enought related posts, result will filled up with more posts');
    const moreRecipes = await findWithLimit(10);
    results = results.concat(moreRecipes);
  }

  return results;
};

module.exports.deleteDummyData = async function () {
  const query = "DELETE FROM posts WHERE title_seo = 'from-test'";
  const result = await dbHelper.query(query, [], false);
  logger.info(result);
};

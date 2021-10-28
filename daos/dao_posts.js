const moment = require('moment');
const pretty = require('pretty');

moment.locale('en');

const { Index } = require('flexsearch');
const log4js = require('log4js');
const dbHelper = require('../utils/db_helper');
const utils = require('../utils/utils');

const logger = log4js.getLogger('dao_posts');
logger.level = 'info';

let searchIndex;

/**
 *
 * @param {*} row
 */
function convertPost(row) {
  const baseImagesUrl = process.env.BASE_IMAGE_URL;
  const baseThumbImagesUrl = process.env.BASE_THUMB_IMAGE_URL;
  const result = {
    id: row.id,
    title: row.title,
    title_seo: row.title_seo,
    sub_title: row.sub_title,
    created_at: row.created_at,
    created_at_friendly: moment(row.created_at).format('MMM DD, YYYY'),
    created_at_friendly_2: moment(row.created_at).format('YYYY-MM-DD'),
    created_at_friendly_3: moment(row.created_at).format('YYYY-MM-DD HH:mm:ss'),
    created_at_ago: moment(row.created_at).fromNow(),

    updated_at: row.updated_at,
    updated_at_friendly: moment(row.updated_at).format('MMM DD, YYYY'),
    updated_at_friendly_2: moment(row.updated_at).format('YYYY-MM-DD'),
    updated_at_friendly_3: moment(row.updated_at).format('YYYY-MM-DD HH:mm:ss'),
    updated_at_ago: moment(row.updated_at).fromNow(),

    content: pretty(row.content),
    summary: row.summary,
    active: row.active,
    featured_image_name: row.featured_image_name,
    tags: row.tags,
    tags_array: row.tags.split(','),
    url: `${process.env.JND_BASE_URL}post/${row.title_seo}`,
    url_edit: `${process.env.JND_BASE_URL}admin/edit/${row.id}`,
    default_loading_image: process.env.JND_DEFAULT_LOADING_IMAGE,
    default_thumb_loading_image: process.env.JND_DEFAULT_THUMB_LOADING_IMAGE,
  };

  if (row.featured_image_name.includes(process.env.CLOUDINARY_FOLDER)) {
    result.featured_image_url = baseImagesUrl + row.featured_image_name;
    result.thumb_image_url = baseThumbImagesUrl + row.featured_image_name;
  } else {
    result.featured_image_url = `${baseImagesUrl + process.env.CLOUDINARY_FOLDER}/${row.featured_image_name}`;
    result.thumb_image_url = `${baseThumbImagesUrl + process.env.CLOUDINARY_FOLDER}/${row.featured_image_name}`;
  }

  return result;
}

module.exports.insert = async function (post) {
  logger.info(`inserting post ${JSON.stringify(post, null, 2)}`);
  const titleSeo = utils.dashString(post.title);
  const today = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = `INSERT INTO posts(created_at, 
    updated_at, 
    title, 
    title_seo, 
    "content", 
    summary, 
    active, 
    featured_image_name, 
    tags,
    sub_title) 
  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`;
  const bindings = [
    today,
    today,
    post.title,
    titleSeo,
    post.content,
    post.summary,
    post.active,
    post.featured_image_name,
    post.tags,
    post.sub_title,
  ];

  const result = await dbHelper.query(query, bindings, false);
  // logger.info(JSON.stringify(result, null, 2));
  const postId = result.rows[0].id;

  await this.resetCache();
  return postId;
};
module.exports.update = async function (post) {
  logger.info(`Updating post ${post.id} ${post.title}`);
  const today = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = `UPDATE posts 
    SET title=$1, title_seo=$2, content=$3, active=$4, updated_at=$5,
    summary=$6, featured_image_name=$7, tags=$8, sub_title=$9
    WHERE id=$10`;
  const titleSeo = utils.dashString(post.title);
  const bindings = [
    post.title,
    titleSeo,
    post.content,
    post.active,
    today,
    post.summary,
    post.featured_image_name,
    post.tags,
    post.sub_title,
    post.id,
  ];

  await dbHelper.query(query, bindings, false);

  await this.resetCache();
};

/**
 *
 * @param {number} limit
 * @param {boolean} onlyActives
 * @param {boolean} witchCache
 */
async function findWithLimit(limit = 100, onlyActives = true, witchCache = true) {
  logger.info(`findWithLimit, limit: ${limit}`);
  const condActives = onlyActives ? ' WHERE active=true ' : '';
  const query = `SELECT * FROM posts ${condActives} ORDER BY created_at DESC LIMIT $1 `;
  const bindings = [limit];

  const result = await dbHelper.query(query, bindings, witchCache);
  logger.info(`posts: ${result.rows.length}`);
  const posts = [];
  for (let i = 0; i < result.rows.length; i++) {
    posts.push(convertPost(result.rows[i]));
  }
  return posts;
}

module.exports.resetCache = async function () {
  await this.buildSearchIndex();
};

module.exports.findAll = function (onlyActives = true, witchCache = true) {
  return findWithLimit(1000, onlyActives, witchCache);
};

module.exports.findAllTags = async function (witchCache = true) {
  // to get all tags we have to get all active posts, iterate them and extract the tags
  const allPosts = await this.findAll(true, witchCache);
  const tags = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const post of allPosts) {
    // eslint-disable-next-line no-restricted-syntax
    for (const tag of post.tags_array) {
      if (!tags.includes(tag.toLowerCase())) {
        tags.push(tag.toLowerCase());
      }
    }
  }
  const objects = [];
  const today = moment().format('YYYY-MM-DD');
  // eslint-disable-next-line no-restricted-syntax
  for (const tag of tags) {
    const obj = {
      name: tag,
      url: `${process.env.JND_BASE_URL}tag/${tag}`,
      updated_at_friendly: today,
      featured_image_url: `${process.env.JND_DEFAULT_IMAGE_URL}`,
    };
    objects.push(obj);
  }

  return objects;
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
  const tagLike = `%${tag}%`;
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

module.exports.findByTags = async function (tags, witchCache = true) {
  const promises = [];
  tags.forEach((tag) => {
    promises.push(this.findByTag(tag, witchCache));
  });

  // every promise is an array of posts
  const results = await Promise.all(promises);
  let allPosts = [];
  results.forEach((posts) => {
    allPosts = allPosts.concat(posts);
  });

  // return unique posts
  return allPosts.filter((thing, index, self) => self.findIndex((t) => t.id === thing.id) === index);
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

  const options = {
    charset: 'latin:extra',
    preset: 'score',
    tokenize: 'full',
    cache: false,
  };
  searchIndex = new Index(options);

  const all = await this.findAll();

  const size = all.length;
  for (let i = 0; i < size; i++) {
    // we might concatenate the fields we want for our content
    const content = `${all[i].title}`;
    const key = Number(all[i].id);
    searchIndex.add(key, content);
  }
  logger.info('index built');
  // console.timeEnd('buildIndexTook');
};

/**
   * @param {string} text to search
   * @param {number} excludeId optinal exclude the given post id
   * @returns {[]} array of posts
   */
module.exports.findRelated = async function (text, excludeId) {
  logger.info(`look for related results with: ${text}`);
  if (!searchIndex) {
    await this.buildSearchIndex();
  }

  const limit = 16;
  // When suggestion is enabled all results will be filled up (until limit, default 1000) with similar matches ordered by relevance.
  const resultIds = await searchIndex.search(text, limit, { suggest: true });

  logger.info(`related results: ${resultIds.length}`);
  logger.info(resultIds);
  let results = [];
  if (resultIds.length > 0) {
    results = await this.findByIds(resultIds);
    results = results.filter((post) => post.id !== excludeId);
  }

  // const limitHalf = Math.round(limit / 2);
  // if (results.length < limitHalf) {
  //   logger.info('not enought related posts, result will filled up with more posts');
  //   const morePosts = await findWithLimit(limitHalf);
  //   morePosts.forEach((post) => {
  //     let exists = false;
  //     results.forEach((postResults) => {
  //       if (post.id === postResults.id || post.id === excludeId) {
  //         exists = true;
  //       }
  //     });
  //     if (!exists && results.length < limit) results.push(post);
  //   });
  // }

  return results;
};

module.exports.deleteDummyData = async function () {
  const query = "DELETE FROM posts WHERE title_seo = 'from-test'";
  const result = await dbHelper.query(query, [], false);
  logger.info(result);
};

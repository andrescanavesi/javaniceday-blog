const parseDbUrl = require('parse-database-url');
const { Pool } = require('pg');
const NodeCache = require('node-cache');

const log4js = require('log4js');

const queryCache = new NodeCache();
const logger = log4js.getLogger('db_helper');


let dbConfig;
let rejectUnauthorized = false; // TODO fix this
if (process.env.NODE_ENV === 'development') {
  dbConfig = parseDbUrl(process.env.JND_DATABASE_URL);
  rejectUnauthorized = false;
} else {
  dbConfig = parseDbUrl(process.env.DATABASE_URL);
}

const pool = new Pool({
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  password: dbConfig.password,
  port: dbConfig.port,
  ssl: {
    rejectUnauthorized,
  },

});

/**
 *
 * @param {stirng} theQuery
 * @param {[]]} bindings
 * @param {boolean} withCache true to cache the result
 * @return {Promise<*>}
 */
module.exports.query = async function (theQuery, bindings, withCache) {
  if (withCache) {
    logger.info(`executing query with cache ${theQuery}`);
    const key = theQuery + JSON.stringify(bindings);
    const value = queryCache.get(key);
    if (value === undefined) {
      try {
        logger.info('no cache for this query, will go to the DB');
        const queryResult = await pool.query(theQuery, bindings);
        queryCache.set(key, queryResult);
        return queryResult;
      } catch (error) {
        throw new Error(`Error executing query with cache ${theQuery} error: ${error}`);
      }
    } else {
      logger.info(`returning query result from cache ${theQuery}`);
      // log.info(queryCache.getStats());
      return value;
    }
  } else {
    try {
      logger.info(`executing query without cache ${theQuery}`);
      const result = await pool.query(theQuery, bindings);

      // delete all the cache content if we are inserting or updating data
      const auxQuery = theQuery.trim().toLowerCase();
      if (auxQuery.startsWith('insert') || auxQuery.startsWith('update')) {
        queryCache.flushAll();
        queryCache.flushStats();
        logger.info(`the cache was flushed because of the query ${theQuery}`);
      }
      return result;
    } catch (error) {
      throw new Error(`Error executing query without cache  ${theQuery} error: ${error}`);
    }
  }
};

module.exports.execute = pool;

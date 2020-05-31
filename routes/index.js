const express = require('express');
const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const daoPosts = require('../daos/dao_posts');
const responseHelper = require('../utils/response_helper');

const router = express.Router();

const logger = log4js.getLogger('routes/index.js');
logger.level = 'info';

function readContent(name, kind = 'posts') {
  if (!name) {
    throw new Error('name param is empty');
  }
  const file = `${name}.html`;
  const content = path.resolve(__dirname, '../content/', kind, file);
  logger.info('reading file:', content);
  return new Promise((resolve, reject) => {
    fs.readFile(content, 'utf8', (err, data) => {
      if (err) {
        reject(new Error(err));
      } else {
        resolve(data);
      }
    });
  });
}

function readAll(kind = 'posts') {
  const directoryPath = path.join(__dirname, '../content', kind);
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, 'utf8', (err, files) => {
      if (err) {
        reject(new Error(err));
      } else {
        resolve(files);
      }
    });
  });
}

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    const posts = await daoPosts.findAll();

    responseJson.posts = posts;
    responseJson.isHomePage = true;
    responseJson.searchText = '';
    res.render('index', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/post/:titleSeo', async (req, res, next) => {
  try {
    logger.info(`title seo: ${req.params.titleSeo}`);
    const post = await daoPosts.findByTitleSeo(req.params.titleSeo);
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.post = post;
    responseJson.title = post.title;
    responseJson.description = post.summary;
    responseJson.isPostPage = true;
    responseJson.linkToThisPage = `${process.env.JND_BASE_URL}/post/${post.title_seo}`;
    res.render('post', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/tag/:tag', async (req, res, next) => {
  try {
    logger.info(`tag: ${req.params.tag}`);
    const data = await daoPosts.findByTag(req.params.tag, true);
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.posts = data;
    responseJson.title = `${req.params.tag} - javaniceday.com`;
    res.render('index', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/:year/:month/:day/:name', async (req, res, next) => {
  try {
    const page = `/${req.params.name}`;
    res.redirect(page);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

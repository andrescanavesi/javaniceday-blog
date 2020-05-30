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

router.get('/post/:name', async (req, res, next) => {
  try {
    const data = await readContent(req.params.name, 'posts');
    res.render('content', { title: 'Im a post', content: data });
  } catch (e) {
    next(e);
  }
});

router.get('/page/:name', async (req, res, next) => {
  try {
    const data = await readContent(req.params.name, 'pages');
    res.render('content', { title: 'Im a page', content: data });
  } catch (e) {
    next(e);
  }
});


module.exports = router;

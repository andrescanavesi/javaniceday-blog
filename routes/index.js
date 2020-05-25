const express = require('express');
const fs = require('fs');
const path = require('path');
const log4js = require('log4js');

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

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
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

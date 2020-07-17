const express = require('express');
const log4js = require('log4js');
const daoPosts = require('../daos/dao_posts');
const responseHelper = require('../utils/response_helper');

const router = express.Router();

const logger = log4js.getLogger('routes/index.js');
logger.level = 'info';

/**
 *  GET home page.
 */
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
    responseJson.linkToThisPage = post.url;
    responseJson.pageImage = post.featured_image_url;
    responseJson.pageDateModified = post.updated_at_friendly_2;

    // TODO create a relatedposts collection
    const posts = await daoPosts.findRelated(post.tags);

    responseJson.relatedPosts = posts;

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
    responseJson.page_header = req.params.tag;
    res.render('index', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/:year/:month/:day/:name', async (req, res, next) => {
  try {
    // redirect old posts from the old blog
    const page = `/post/${req.params.name}`;
    res.redirect(page);
  } catch (e) {
    next(e);
  }
});

router.get('/category/:tag', async (req, res, next) => {
  try {
    // redirect old categories from the old blog
    const page = `/tag/${req.params.tag}`;
    res.redirect(page);
  } catch (e) {
    next(e);
  }
});

router.get('/ads.txt', (req, res, next) => {
  try {
    const content = 'google.com, pub-9559827534748081, DIRECT, f08c47fec0942fa0';
    res.set('Content-Type', 'text/plain');
    res.status(200);
    res.send(content);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

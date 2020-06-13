const express = require('express');
const log4js = require('log4js');
const daoPosts = require('../daos/dao_posts');
const responseHelper = require('../utils/response_helper');

const router = express.Router();

const logger = log4js.getLogger('routes/admin.js');
logger.level = 'info';

/**
 *  GET default admin page
 */
router.get('/', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    const posts = await daoPosts.findAll(false);

    responseJson.posts = posts;
    responseJson.isHomePage = false;
    responseJson.searchText = '';
    responseJson.layout = 'layout-admin';
    res.render('admin', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/edit/:id', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    const post = await daoPosts.findById(req.params.id, true, false);

    responseJson.post = post;
    responseJson.isHomePage = false;
    responseJson.searchText = '';
    responseJson.layout = 'layout-admin';
    res.render('edit-post', responseJson);
  } catch (e) {
    next(e);
  }
});

router.post('/edit/:id', async (req, res, next) => {
  try {
    logger.info(`save post ${req.params.id} ${req.body.title}`);

    const responseJson = responseHelper.getResponseJson(req);
    let post = await daoPosts.findById(req.params.id, true, false);
    post.title = req.body.title;
    post.content = req.body.content;
    post.active = req.body.active === 'on';

    await daoPosts.update(post);

    post = await daoPosts.findById(req.params.id, true, false);

    responseJson.post = post;
    responseJson.isHomePage = false;
    responseJson.searchText = '';
    responseJson.layout = 'layout-admin';
    res.render('edit-post', responseJson);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

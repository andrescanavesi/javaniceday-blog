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
    const posts = await daoPosts.findAll(false, false);

    responseJson.posts = posts;
    responseJson.layout = 'layout-admin';
    res.render('admin', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/create-post', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);

    responseJson.post = {
      title: 'a s b',
      title_seo: '',
      content: 'abc',
      summary: 'summ',
      featured_image_name: 'christopher-gower-m_HRfLhgABo-unsplash.jpg',
      tags: 'dev',
      active: false,
    };
    responseJson.action = '/admin/create-post';
    responseJson.layout = 'layout-admin';
    res.render('edit-post', responseJson);
  } catch (e) {
    next(e);
  }
});


router.post('/create-post', async (req, res, next) => {
  try {
    const post = {
      title: req.body.title,
      content: req.body.title,
      summary: req.body.summary,
      featured_image_name: req.body.featured_image_name,
      tags: req.body.tags,
      active: req.body.active === 'on',
    };

    const postId = await daoPosts.insert(post);

    const postCreated = await daoPosts.findById(postId, true, false);

    res.redirect(postCreated.url_edit);
  } catch (e) {
    next(e);
  }
});

router.get('/edit/:id', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    const post = await daoPosts.findById(req.params.id, true, false);

    responseJson.post = post;
    responseJson.action = post.url_edit;
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
    post.summary = req.body.summary;
    post.tags = req.body.tags;
    post.featured_image_name = req.body.featured_image_name;
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

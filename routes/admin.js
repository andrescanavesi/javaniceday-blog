const express = require('express');
const log4js = require('log4js');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const daoPosts = require('../daos/dao_posts');
const responseHelper = require('../utils/response_helper');
const controllerSearchTerms = require('../controllers/controller_search_terms');

const router = express.Router();

const logger = log4js.getLogger('routes/admin.js');
logger.level = 'info';

let csrfProtection;

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  logger.info('dev');
  // we are more flexible in development and testing
  csrfProtection = csrf({
    cookie: true,
  });
} else {
  logger.info('non dev');
  csrfProtection = csrf({
    cookie: true, signed: true, secure: true, httpOnly: true, sameSite: 'strict',
  });
}

const parseForm = bodyParser.urlencoded({ extended: false });

/**
 *  GET default admin page
 */
router.get('/', csrfProtection, async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.csrfToken = req.csrfToken();
    const posts = await daoPosts.findAll(false, false);

    responseJson.posts = posts;
    responseJson.layout = 'layout-admin';
    res.render('admin', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/create-post', csrfProtection, async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.csrfToken = req.csrfToken();

    const defaultContent = `

    <!-- Template -->

    <pre>
      <code class="javascript">
        // some code...
      </code>
    </pre>

    <div class="alert alert-danger" role="alert">
      Test alert
    </div>
    
    <div class="alert alert-primary" role="alert">
      Test info
    </div>

    <div class="alert alert-warning" role="alert">
      Test info
    </div>
    
    `;

    responseJson.post = {
      title: '',
      title_seo: '',
      sub_title: '',
      content: defaultContent,
      summary: '',
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

router.post('/create-post', parseForm, csrfProtection, async (req, res, next) => {
  try {
    const post = {
      title: req.body.title,
      sub_title: req.body.sub_title,
      content: req.body.content,
      summary: req.body.summary,
      featured_image_name: req.body.featured_image_name,
      tags: req.body.tags,
      active: req.body.active === 'on',
    };

    const postId = await daoPosts.insert(post);

    const postCreated = await daoPosts.findById(postId, true, false);

    logger.info(`redirecting to ${postCreated.url_edit}`);
    res.redirect(postCreated.url_edit);
  } catch (e) {
    next(e);
  }
});

router.get('/edit/:id', csrfProtection, async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.csrfToken = req.csrfToken();
    const post = await daoPosts.findById(req.params.id, true, false);

    responseJson.post = post;
    responseJson.action = post.url_edit;
    responseJson.layout = 'layout-admin';
    res.render('edit-post', responseJson);
  } catch (e) {
    next(e);
  }
});

router.post('/edit/:id', parseForm, csrfProtection, async (req, res, next) => {
  try {
    logger.info(`save post ${req.params.id} ${req.body.title}`);

    const responseJson = responseHelper.getResponseJson(req);
    responseJson.csrfToken = req.csrfToken();
    let post = await daoPosts.findById(req.params.id, true, false);
    post.title = req.body.title;
    post.sub_title = req.body.sub_title;
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

router.get('/process-seo-list', csrfProtection, async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.csrfToken = req.csrfToken();

    responseJson.action = '/admin/process-seo-list';
    responseJson.layout = 'layout-admin';
    responseJson.csv = '';
    res.render('process-seo-list', responseJson);
  } catch (e) {
    next(e);
  }
});

router.post('/process-seo-list', parseForm, csrfProtection, async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.csrfToken = req.csrfToken();
    responseJson.action = '/admin/process-seo-list';
    responseJson.layout = 'layout-admin';
    responseJson.csv = '';

    const { csv } = req.body;
    await controllerSearchTerms.processCsv(csv);
    // res.redirect('/admin/process-seo-list');
    res.render('process-seo-list', responseJson);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

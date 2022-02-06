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
    cookie: true,
    signed: true,
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

const parseForm = bodyParser.urlencoded({extended: false});

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
    
    <h2>Table of contents</h2>
    <ul>
      <li><a href="#">Link 1</a></li>
      <li><a href="#">Link 2</a></li>
      <li><a href="#">Link 3</a></li>
    </ul>

    <pre>
      <code class="javascript">
        // some code...
      </code>
    </pre>
    
    <h1>h1. Bootstrap heading</h1>
    <h2>h2. Bootstrap heading</h2>
    <h3>h3. Bootstrap heading</h3>
    <h4>h4. Bootstrap heading</h4>
    <h5>h5. Bootstrap heading</h5>
    <h6>h6. Bootstrap heading</h6>
    
    <small class="text-muted">With faded secondary text</small>
    
    <p class="lead">
        Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Duis mollis, est non commodo luctus.
    </p>    
    
    <p>You can use the mark tag to <mark>highlight</mark> text.</p>
    <p><del>This line of text is meant to be treated as deleted text.</del></p>
    <p><s>This line of text is meant to be treated as no longer accurate.</s></p>
    <p><ins>This line of text is meant to be treated as an addition to the document.</ins></p>
    <p><u>This line of text will render as underlined</u></p>
    <p><small>This line of text is meant to be treated as fine print.</small></p>
    <p><strong>This line rendered as bold text.</strong></p>
    <p><em>This line rendered as italicized text.</em></p>
    
    <p><abbr title="attribute">attr</abbr></p>
<p><abbr title="HyperText Markup Language" class="initialism">HTML</abbr></p>

<blockquote class="blockquote text-left">
  <p class="mb-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>
  <footer class="blockquote-footer">Someone famous in <cite title="Source Title">Source Title</cite></footer>
</blockquote>

<samp>This text is meant to be treated as sample output from a computer program.</samp>

<ul>
  <li>Lorem ipsum dolor sit amet</li>
  <li>Consectetur adipiscing elit</li>
  <li>Integer molestie lorem at massa</li>
  <li>Facilisis in pretium nisl aliquet</li>
  <li>Nulla volutpat aliquam velit
    <ul>
      <li>Phasellus iaculis neque</li>
      <li>Purus sodales ultricies</li>
      <li>Vestibulum laoreet porttitor sem</li>
      <li>Ac tristique libero volutpat at</li>
    </ul>
  </li>
  <li>Faucibus porta lacus fringilla vel</li>
  <li>Aenean sit amet erat nunc</li>
  <li>Eget porttitor lorem</li>
</ul>

<figure class="figure my-3 postFigure">
  <img class="lozad img-fluid rounded postImage" src="https://res.cloudinary.com/dniiru5xy/image/upload/c_scale,w_900/v1590442770/javaniceday.com/jpr5llr6ubqu2l8ootfb.jpg" data-loaded="true">
  <figcaption class="figure-caption text-center">Image caption</figcaption>
</figure>

    
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

    const {csv} = req.body;
    await controllerSearchTerms.processCsv(csv);
    // res.redirect('/admin/process-seo-list');
    res.render('process-seo-list', responseJson);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

const express = require('express');
const log4js = require('log4js');
const daoPosts = require('../daos/dao_posts');
const daoSearchTerms = require('../daos/dao_search_terms');
const responseHelper = require('../utils/response_helper');

const router = express.Router();

const logger = log4js.getLogger('routes/index.js');
logger.level = 'info';

/**
 *  GET home page.
 */
router.get('/', async (req, res, next) => {
  try {
    if (req.query.s && req.query.s.length > 0) {
      // Chrome uses /?s=something to search in hour site so redirect to our search page
      const page = `/search?q=${req.query.s}`;
      res.redirect(page);
    } else {
      const responseJson = responseHelper.getResponseJson(req);
      const posts = await daoPosts.findAll(true, true);

      responseJson.posts = posts;
      responseJson.isHomePage = true;
      responseJson.searchText = '';
      // eslint-disable-next-line max-len
      responseJson.defaultLoadingImage =
        'https://res.cloudinary.com/dniiru5xy/image/upload/c_scale,f_auto,q_50,w_900/v1597923257/javaniceday.com/default-image.jpg';
      res.render('index', responseJson);
    }
  } catch (e) {
    next(e);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const textToSearch = req.query.q;
    logger.info(`search ${textToSearch}`);
    const responseJson = responseHelper.getResponseJson(req);
    const posts = await daoPosts.findRelated(textToSearch);

    responseJson.posts = posts;
    responseJson.isHomePage = true;
    responseJson.searchText = textToSearch;
    responseJson.title = textToSearch;
    responseJson.description = textToSearch;
    res.render('index', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/post/:titleSeo', async (req, res) => {
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
    responseJson.showDisqus = true;

    // const posts = await daoPosts.findRelated(post.tags, post.id);
    let relatedPosts = [];
    if (post.tags_array && post.tags_array.length > 0) {
      // relatedPosts = await daoPosts.findByTag(post.tags[0], true);
      relatedPosts = await daoPosts.findByTags(post.tags_array, true);
    }

    responseJson.relatedPosts = relatedPosts;
    if (relatedPosts) responseJson.recommendedPosts = relatedPosts.slice(0, 3);
    else responseJson.recommendedPosts = [];

    if (post.title_seo === 'about') {
      responseJson.showRelatedPosts = false;
    }

    res.render('post', responseJson);
  } catch (e) {
    // next(e);
    logger.error(e);

    // to avoid SEO penalization. In the future throw  404 (see Boom package in npm)
    res.redirect(process.env.JND_BASE_URL);
  }
});

router.get('/tag/:tag', async (req, res, next) => {
  try {
    logger.info(`tag: ${req.params.tag}`);
    const data = await daoPosts.findByTag(req.params.tag, true);
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.posts = data;
    responseJson.title = `${req.params.tag} - javaniceday.com`;
    responseJson.description = responseJson.title;
    responseJson.pageHeader = req.params.tag;
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

// backward compatibility to old urls such as
// https://www.javaniceday.com/2018/06/07/get-visualforce-usage-stats-from-visualforceaccessmetrics/amp/
router.get('/:year/:month/:day/:name/:amp', async (req, res, next) => {
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
router.get('/robots.txt', async (req, res, next) => {
  try {
    const content = `User-agent: *\nAllow: /\nSitemap: ${process.env.JND_BASE_URL}sitemap.xml`;
    res.set('Content-Type', 'text/plain');
    res.status(200);
    res.send(content);
  } catch (e) {
    next(e);
  }
});

/**
 * SEO list of posts
 */
router.get('/l/:termSeo', async (req, res, next) => {
  try {
    const {termSeo} = req.params;
    const responseJson = responseHelper.getResponseJson(req);
    const searchTerm = await daoSearchTerms.findByTerm(termSeo, false, true, true);

    const term = searchTerm ? searchTerm.term : termSeo.split('_').join(' ');

    const posts = await daoPosts.findRelated(term);

    responseJson.posts = posts;
    responseJson.isHomePage = false;
    responseJson.searchText = term;
    responseJson.title = `${term}`;
    responseJson.description = responseJson.title;
    res.render('seo-list', responseJson);
  } catch (e) {
    next(e);
  }
});

/**
 * All tags, posts and search terms list
 */
router.get('/all/:kind', async (req, res, next) => {
  try {
    const {kind} = req.params;
    const responseJson = responseHelper.getResponseJson(req);
    const links = [];
    let title = '';
    let description = '';
    let records;
    switch (kind) {
      case 'tags':
        title = 'All tags';
        description = 'All tags';
        records = await daoPosts.findAllTags(true);
        records.forEach(item => {
          links.push({
            url: item.url,
            name: item.name,
            featured_image_url: item.featured_image_url,
          });
        });
        break;
      case 'search':
        title = 'All search terms';
        description = 'All search terms';
        records = await daoSearchTerms.findAll(false, true);
        records.forEach(item => {
          links.push({
            url: item.url,
            name: item.term,
            featured_image_url: item.featured_image_url,
          });
        });
        break;
      case 'posts':
        title = 'All posts';
        description = 'All posts';
        records = await daoPosts.findAll(true, true);
        records.forEach(item => {
          links.push({
            url: item.url,
            name: item.title,
            featured_image_url: item.thumb_image_url,
            summary: item.summary,
            created_at_friendly: `Posted on ${item.created_at_friendly}`,
            tags_array: item.tags_array,
          });
        });
        break;
      default:
        throw new Error('Unsupported kind');
    }

    responseJson.links = links;
    responseJson.isHomePage = false;
    responseJson.searchText = '';
    responseJson.title = title;
    responseJson.description = description;
    res.render('link-list', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/about/andres-canavesi', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.posts = [];
    responseJson.linkToThisPage = `${process.env.JND_BASE_URL}about/andres-canavesi`;
    responseJson.featuredImageUrl =
      'https://res.cloudinary.com/dniiru5xy/image/upload/c_scale,w_900/v1590442770/javaniceday.com/andres-canavesi-linkedin-2021.jpg';
    responseJson.title = 'About Andrés Canavesi - www.javaniceday.com';
    responseJson.description = `Software Engineer and Blogger specialized in Salesforce, 
    Node.js and Java. AWS and Heroku enthusiastic.`;
    responseJson.pageHeader = 'About Andrés Canavesi';
    responseJson.about = responseJson.description;
    responseJson.keywords = 'about,andres,canavesi';
    responseJson.headline = responseJson.title;
    res.render('about', responseJson);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

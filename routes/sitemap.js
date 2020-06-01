const express = require('express');

const router = express.Router();
const js2xmlparser = require('js2xmlparser');
const moment = require('moment');
const daoPosts = require('../daos/dao_posts');

/**
 * It generates an standard sitemal.xml for SEO purposes
 */
router.get('/', async (req, res, next) => {
  try {
    const baseUrl = process.env.JND_BASE_URL;
    const posts = await daoPosts.findAll();
    const collection = [];
    let today = moment();
    today = today.format('YYYY-MM-DD');
    // add site root url
    const rootUrl = {};
    rootUrl.loc = baseUrl;
    rootUrl.lastmod = today;
    rootUrl.changefreq = 'daily';
    rootUrl.priority = '1.0';
    rootUrl['image:image'] = {
      'image:loc': process.env.JND_DEFAULT_IMAGE_URL,
      'image:caption': 'javaniceday.com. Software development blog',
    };
    collection.push(rootUrl);

    // add posts urls
    for (let i = 0; i < posts.length; i++) {
      const url = {};
      url.loc = posts[i].url;
      url.lastmod = posts[i].updated_at_friendly_2;
      url.changefreq = 'monthly';
      url['image:image'] = {
        'image:loc': posts[i].featured_image_url,
        'image:caption': posts[i].title,
      };

      collection.push(url);
    }

    const col = {
      '@': {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1',
      },
      url: collection,
    };
    const xml = js2xmlparser.parse('urlset', col);
    res.set('Content-Type', 'text/xml');
    res.status(200);
    res.send(xml);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

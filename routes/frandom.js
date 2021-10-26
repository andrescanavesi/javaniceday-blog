const express = require('express');
const log4js = require('log4js');
const daoPosts = require('../daos/dao_posts');
const responseHelper = require('../utils/response_helper');

const router = express.Router();

const logger = log4js.getLogger('routes/frandom.js');
logger.level = 'info';

router.get('/', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    // const posts = await daoPosts.findAll(true, true);

    // eslint-disable-next-line max-len
    responseJson.defaultLoadingImage = 'https://res.cloudinary.com/dniiru5xy/image/upload/c_scale,f_auto,q_50,w_900/v1597923257/javaniceday.com/default-image.jpg';
    res.render('frandom', responseJson);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

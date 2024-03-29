require('dotenv-safe').config();

// const createError = require('http-errors');
const express = require('express');
const useragent = require('express-useragent');
const favicon = require('express-favicon');
const basicAuth = require('express-basic-auth');
const compression = require('compression');
const path = require('path');
const cookieParser = require('cookie-parser');
const log4js = require('log4js');
const utils = require('./utils/utils');

const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const sitemapRouter = require('./routes/sitemap');
const frandomRouter = require('./routes/frandom');

const logger = log4js.getLogger('app.js');
logger.level = 'info';

/**
 *
 * @returns {string} the text to be displayed when users hit on cancel prompt button
 */
function getUnauthorizedResponse() {
  return 'Unauthorized';
}

// http auth basic options
const authOptions = {
  challenge: true, // it will cause most browsers to show a popup to enter credentials on unauthorized responses,
  users: { admin: process.env.JND_HTTP_AUTH_BASIC_PASSWORD },
  authorizeAsync: false,
  unauthorizedResponse: getUnauthorizedResponse,
};

function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

const app = express();

// redirect any page form http to https
// redirect also from non-www to www
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test' && !utils.isSecure(req)) {
    const host = req.headers.host.startsWith('www.') ? req.headers.host : `www.${req.headers.host}`;
    const url = `https://${host}${req.url}`;
    res.redirect(301, url);
  } else {
    next();
  }
});

app.use(compression({ filter: shouldCompress }));
app.use(useragent.express());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(favicon(`${__dirname}/public/images/favicon.jpg`));

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// all requests to this route will require user and password
app.use('/admin', basicAuth(authOptions), adminRouter);
app.use('/sitemap.xml', sitemapRouter);
app.use('/frandom', frandomRouter);

// error handler
app.use((err, req, res) => {
  logger.error(err.message);
  res.locals.message = 'oops!';
  res.locals.error = {};
  // set locals, only providing error in development
  if (process.env.NODE_ENV === 'development') {
    res.locals.message = err.message;
    res.locals.error = err;
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

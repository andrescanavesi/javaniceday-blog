require('dotenv-safe').config();

// const createError = require('http-errors');
const express = require('express');
const apicache = require('apicache');
const useragent = require('express-useragent');
const favicon = require('express-favicon');
const basicAuth = require('express-basic-auth');
const compression = require('compression');
const path = require('path');
const cookieParser = require('cookie-parser');
const log4js = require('log4js');

const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const sitemapRouter = require('./routes/sitemap');

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

const app = express();
app.use(compression());
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

const cache = apicache.middleware;
// with cache at web level using apicache module.
// all public endpoints are being cached
app.use('/', cache('24 hours'), indexRouter);

// all requests to this route will require user and password
app.use('/admin', basicAuth(authOptions), adminRouter);
app.use('/sitemap.xml', sitemapRouter);

// error handler
app.use((err, req, res, next) => {
  logger.error(err);
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

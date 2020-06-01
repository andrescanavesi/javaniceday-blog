// const createError = require('http-errors');
const express = require('express');
const useragent = require('express-useragent');
const favicon = require('express-favicon');
const compression = require('compression');
const path = require('path');
const cookieParser = require('cookie-parser');
const log4js = require('log4js');
const sitemapRouter = require('./routes/sitemap');

const indexRouter = require('./routes/index');

const logger = log4js.getLogger('app.js');

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

app.use('/', indexRouter);
app.use('/sitemap.xml', sitemapRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use((err, req, res, next) => {
  logger.error(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

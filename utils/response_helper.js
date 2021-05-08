const moment = require('moment');

/**
 * JND stands for javaniceday
 */
module.exports.getResponseJson = function (req) {
  // default attributes for the response response.
  const responseJson = {};
  responseJson.title = 'javaniceday.com – Software development blog.';
  responseJson.today = moment().format('YYYY-MM-DD');
  responseJson.isProduction = process.env.NODE_ENV === 'production' || false;
  responseJson.adsenseEnabled = process.env.JND_ADSENSE_ENABLED === true || process.env.JND_ADSENSE_ENABLED === 'true';
  responseJson.isHomePage = false;
  responseJson.isPostPage = false;
  responseJson.createdAt = moment().format('YYYY-MM-DD');
  responseJson.updatedAt = moment().format('YYYY-MM-DD');
  responseJson.linkToThisPage = process.env.JND_BASE_URL || 'http://localhost:3000';
  responseJson.description = 'javaniceday.com – Software development blog.';
  responseJson.metaImage = process.env.JND_DEFAULT_IMAGE_URL;
  responseJson.keywords = 'software, development';
  responseJson.searchText = '';
  responseJson.showRelatedPosts = true;

  const metaCache = process.env.JND_META_CACHE || '1'; // in seconds
  responseJson.metaCache = `public, max-age=${metaCache}`;

  responseJson.isMobile = req.useragent.isMobile;
  responseJson.isDesktop = req.useragent.isDesktop;

  // structured data
  responseJson.pageType = 'Blog';
  responseJson.pageName = 'javaniceday.com';
  responseJson.pageOrganization = 'javaniceday.com';
  responseJson.pageImage = process.env.JND_DEFAULT_IMAGE_URL;
  responseJson.pageUrl = process.env.JND_BASE_URL;
  responseJson.pageDatePublished = '2020-06-02';
  responseJson.pageDateModified = moment().format('YYYY-MM-DD');// today
  responseJson.pageLogo = 'http://...'; // TODO
  responseJson.pageDescription = responseJson.description;

  responseJson.siteName = 'javaniceday.com';
  responseJson.author = 'Andres Canavesi';
  responseJson.publisher = 'Andres Canavesi';

  responseJson.currentYear = moment().format('YYYY');

  responseJson.lang = 'en';
  responseJson.locale = 'en_EN';

  responseJson.isPostPage = false;

  responseJson.isAuthenticated = req.headers.authorization && req.headers.authorization.startsWith('Basic ');

  responseJson.defaultLoadingImage = process.env.JND_DEFAULT_LOADING_IMAGE;

  responseJson.cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
  responseJson.cloudinaryUnsignedUploadPreset = process.env.CLOUDINARY_UNSIGNED_UPLOADS_PRESET;
  responseJson.imagesBaseUrl = process.env.BASE_IMAGE_URL;
  responseJson.imagesFolder = process.env.CLOUDINARY_FOLDER;

  return responseJson;
};

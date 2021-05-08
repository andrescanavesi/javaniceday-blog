/**
 *
 * @param {String} string example: All about Node.js
 * @returns all-about-node-js
 */
module.exports.dashString = function (string) {
  return string
    .toLowerCase()
    .replace('ñ', 'n')
    .replace(/[^\w ]+/g, '-')
    .replace(/ +/g, '-')
    .replace(/-{2,}/g, '-');
};

/**
 * @param req express http request
 * @returns true if the http request is secure (comes form https)
 */
module.exports.isSecure = function (req) {
  if (req.headers['x-forwarded-proto']) {
    return req.headers['x-forwarded-proto'] === 'https';
  }
  return req.secure;
};

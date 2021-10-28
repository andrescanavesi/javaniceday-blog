const express = require('express');
const log4js = require('log4js');
const responseHelper = require('../utils/response_helper');
const { randomIntFromInterval } = require('../utils/utils');
const companiesRepo = require('../daos/frandomRepos/companies_repo');
const personsRepo = require('../daos/frandomRepos/persons_repo');

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

router.get('/api', (req, res) => {
  const examples = {
    companies: [
      {
        endpoint: '/frandom/api/companies',
        description: 'Companies from US',
      },
      {
        endpoint: '/frandom/api/companies?countryCode=mx&quantity=5',
        description: 'Companies from MX',
      },
    ],
    persons: [
      {
        endpoint: '/frandom/api/persons',
        description: 'A person from US',
      },
      {
        endpoint: '/frandom/api/persons?countryCode=mx&quantity=5',
        description: 'A person from MX',
      },
    ],
    numbers: [
      {
        endpoint: '/frandom/api/numbers',
        description: 'A person from US',
      },
      {
        endpoint: '/frandom/api/numbers?min=0&max=700&quantity=5',
        description: 'Random numbers between two numbers',
      },
    ],
  };
  res.json(examples);
});

router.get('/api/companies', (req, res, next) => {
  try {
    res.json(companiesRepo.getRandomCompanies(req.query.countryCode, req.query.quantity));
  } catch (e) {
    next(e);
  }
});

router.get('/api/persons', (req, res, next) => {
  try {
    res.json(personsRepo.getRandomPersons(req.query.countryCode));
  } catch (e) {
    next(e);
  }
});

router.get('/api/numbers', (req, res, next) => {
  try {
    const min = req.query.min ? Number(req.query.min) : 0;
    const max = req.query.max ? Number(req.query.max) : 1000;
    const quantity = req.query.quantity ? Number(req.query.quantity) : 5;
    const numbers = [];
    for (let i = 0; i < quantity; i++) {
      numbers.push({
        min,
        max,
        number: randomIntFromInterval(min, max),
      });
    }
    res.json(numbers);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

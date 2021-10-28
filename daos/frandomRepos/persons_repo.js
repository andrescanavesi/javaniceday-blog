// based on https://randommer.io/Name
const { randomIntFromInterval } = require('../../utils/utils');

const repo = {
  us: {
    firstNames: ['Emelie', 'Zara', 'Jonny', 'Marie', 'John'],
    lastNames: ['Jackson', 'Sloan'],
  },
  mx: {
    firstNames: ['Juan', 'Luis', 'Marcelo', 'Julio', 'Jose'],
    lastNames: ['Perez', 'Rodriguez', 'Sosa'],
  },
};
Object.freeze(repo);

const getCode = (countryCode = 'us') => {
  let code = 'us';
  if (countryCode) code = countryCode;
  if (!repo[code]) code = 'us';
  return code;
};

const getRandomPerson = (countryCode = 'us') => {
  const code = getCode(countryCode);
  const firstName = repo[code].firstNames[randomIntFromInterval(0, repo[code].firstNames.length - 1)];
  const lastName = repo[code].lastNames[randomIntFromInterval(0, repo[code].lastNames.length - 1)];
  const displayName = `${firstName} ${lastName}`;
  return {
    code,
    firstName,
    lastName,
    displayName,
  };
};

const getRandomPersons = (countryCode = 'us', quantity = 10) => {
  const code = getCode(countryCode);
  const companies = [];
  for (let i = 0; i < quantity; i++) {
    companies.push(getRandomPerson(code));
  }
  return companies;
};

module.exports.getRandomPerson = getRandomPerson;
module.exports.getRandomPersons = getRandomPersons;

const { randomIntFromInterval } = require('../../utils/utils');
// based on https://randommer.io/random-business-names
const repo = {
  us: {
    names: [
      'Bartell',
      'Caroll',
      'Abbot',
      'Runte',
      'Mertz',
      'Mann - Renner',
      'Prohaska',
      'Reilly - Hoeger',
      'Kirlin, Schuppe and Murphy',
      'Runolfsdottir Group',
      'Kreiger',
      'Schultz - Lockman',
      'Medhurst - Mills',
      'Braun and Son',
      'Green - Kreiger',
      'Ledner, Hand and Durgan',
      'Rice Inc',
      'Turner Group',
      'Murazik',
      'Bechtelar - Mraz',
      'Turner',
      'Bosco, Johnson and Johnson',
      'Zemlak, Bechtelar and Collins',
      'Jones - Jakubowski',
      'Gibson',
      'Nicolas and Sons',
      'Auer',
      'Witting and Sons',
      'Kassulke',
      'Schuster, Wisozk and Lowe',
      'Streich - Hodkiewicz',
      'Hansen, Howe and Hyatt',
      'Lynch',
      'Metz',
      'Kuphal, Schimmel and Senger',
      'Jast - Yundt',
      'Haley, Ernser and Doyle',
      'Zboncak - Rogahn',
      'Ziemann',
      'Feeney',
      'Ruecker, Lindgren and Senger',
      'Ruecker - Tromp',
      'Dicki Group',
      'Pollich, Koepp and Hermann',
      'Reilly - Murphy',
      'Homenick, Jenkins and Wuckert',
      'Heathcote, Oberbrunner and Daniel',
      'Hauck - Nienow',
      'Brekke',
      'Satterfield and Sons',
      'Wiegand - Williamson',
      'Kertzmann, Sanford and Lang',
      'Maggio, Maggio and Johnston',
      'Bergnaum - Nienow',
      'Kovacek and Sons',
      'Pouros Group',
      'Doyle and Sons',
      "O'Conner, Batz and Kassulke",
      'Bashirian Inc',
      'Okuneva Group',
      'Reynolds',
      'Okuneva, Kovacek and Mitchell',
      'Fay, Fay and Satterfield',
      'Okuneva and Sons',
      'Lebsack, Reynolds and Rodriguez',
      'Klein - Williamson',
      'Johns',
      'Hammes and Sons',
      'Friesen - Rau',
      'Harvey - Rowe',
      'Bartoletti - Turner',
      'Prosacco - Purdy',
      'Bogisich - VonRueden',
      'Wiza, Nienow and Ortiz',
      'Romaguera, Reilly and Robel',
      'Hauck Group',
      'Wilderman Group',
      'Corkery',
      'Bins - Funk',
      'Larkin - Rohan',
      'Konopelski - Bednar',
      'Schinner',
      'Batz',
      'Batz - Graham',
      'Tremblay - Huels',
      'Nolan',
      'Jast - Conroy',
      "Lubowitz - O'Hara",
      'McGlynn and Sons',
      'Hilll',
      'Gleason, Kilback and Fahey',
      'Douglas Group',
    ],
    types: ['Inc', 'LLC', 'Capital', 'Foundation', ''],
  },
  mx: {
    names: [
      'Batista',
      'Serrano',
      'Ríos',
      'Romero',
      'Sosa',
      'Santacruz',
      'Pedraza - Chapa',
      'Muñiz Hermanos',
      'Meraz, Laboy and Zelaya',
      'Sauceda Hermanos',
      'Rodarte - Acosta',
      'Blanco - Vanegas',
      'Kadar rodriguez, Olmos and Krauel natera',
      'Dueñas - Nazario',
      'Padilla, Rosario and Ferrer',
      'Ortega - Alemán',
      'Cardenas',
      'Narváez',
      'Fernández, Castañeda and Suárez',
      'Pulido, Valles and Crespo',
      'Rico, Calvillo and Castillo',
      'Barragán - Tejeda',
      'Rosado',
      'Roque, Zamora and Valenzuela',
      'Rivera',
      'Núñez - Ruiz',
      'Cervántez - Colunga',
      'Rolón, Barrientos and Bueno',
      'Cisneros - Rojas',
      'Reynoso, Granado and Garibay',
      'Valdés',
      'Centeno',
      'Almonte e Hijos',
      'Linares Hermanos',
      'Tafoya',
      'Pulido - Gaona',
      'Barrios Hermanos',
      'Márquez - Henríquez',
      'Delacrúz - Xenia',
      'Alcántar',
      'Abeyta - Iglesias',
      'Páez - Gamboa',
      'Alejandro',
      'Olivo e Hijos',
      'Vallejo, Díaz and Xenia',
      'Domínquez',
      'Araña, Gollum and Páez',
      'Mercado Hermanos',
      'Concepción - Piña',
      'Montaño, Vela and Agosto',
      'Sanabria - Linares',
      'Hernádez - Casillas',
      'Esparza, Peña and Calvillo',
      'Linares e Hijos',
      'Negrete - Barragán',
      'Carranza - Pedraza',
    ],
    types: ['S.A', 'S.L', ''],
  },
};
Object.freeze(repo);

const getCode = (countryCode = 'us') => {
  let code = 'us';
  if (countryCode) code = countryCode;
  if (!repo[code]) code = 'us';
  return code;
};

const getRandomCompany = (countryCode = 'us') => {
  const code = getCode(countryCode);
  const name = repo[code].names[randomIntFromInterval(0, repo[code].names.length - 1)];
  const type = repo[code].types[randomIntFromInterval(0, repo[code].types.length - 1)];
  const displayName = `${name} ${type}`;
  return {
    code,
    name,
    type,
    displayName,
  };
};

const getRandomCompanies = (countryCode = 'us', quantity = 10) => {
  const code = getCode(countryCode);
  const companies = [];
  for (let i = 0; i < quantity; i++) {
    companies.push(getRandomCompany(code));
  }
  return companies;
};

module.exports.getRandomCompany = getRandomCompany;
module.exports.getRandomCompanies = getRandomCompanies;
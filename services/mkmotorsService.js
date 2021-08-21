const { parse } = require('node-html-parser');
const axios = require('axios');

const getOfferID = offer => {
  return parseInt(offer.querySelector('a').getAttribute('href').split('/').slice(-1)[0]);
}

exports.getLastOfferID = url => {
  return axios.get(url).then(res => {
    return getOfferID(parse(res.data).querySelector('.car'));
  });
}

exports.getNewOffers = (url, lastOfferID) => {
  return axios.get(url).then(res => {
    const root = parse(res.data);
    const offers = root.querySelectorAll('.car').filter(offer => getOfferID(offer) > parseInt(lastOfferID))
    .map(offer => {
      const details = parse(offer.querySelector('descriptonwraper').text);
      return {
      id: getOfferID(offer),
      url: 'https://mk-motors.com.pl'+offer.querySelector('a').getAttribute('href'),
      image: 'https://mk-motors.com.pl'+offer.querySelector('img').getAttribute('src'),
      title: details.querySelector('markaname').text + ' - ' + details.querySelector('titlecar').text,
      price: offer.querySelector('price').text + ' ' +offer.querySelector('currency').text,
      location: 'Boguchwała',
      details: {
        year: details.querySelector('.rok').text,
        mileage: details.querySelector('.przebieg').text,
        engine_capacity: details.querySelector('.pojemnosc').text,
        fuel_type: details.querySelector('.paliwo').text
      }}});
    return offers;
  });
}
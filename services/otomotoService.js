const { parse } = require('node-html-parser');
const axios = require('axios');

const setSortingType = urlString => {
  const url = new URL(urlString);
  const params = new URLSearchParams(url.search);
  params.set('search[order]', 'created_at_first:desc');
  url.search = params.toString();
  return url.toString();
}

const listLabels = [
  'year',
  'mileage',
  'engine_capacity',
  'fuel_type',
]

exports.setSortingType = setSortingType;

exports.getLastOfferID = url => {
  return axios.get(setSortingType(url)).then(res => {
    return parseInt(parse(res.data).querySelector('main > article').getAttribute('id'));
  });
}

exports.getNewOffers = (url, lastOfferID) => {
  return axios.get(setSortingType(url)).then(res => {
    const root = parse(res.data);
    const offers = root.querySelectorAll('main article').filter(offer => parseInt(offer.getAttribute('id')) > parseInt(lastOfferID))
    .map(offer => {
      return ({
      id: offer.getAttribute('id'),
      url: offer.querySelector('h2[data-testid=ad-title] a').getAttribute('href'),
      image: !offer.querySelector('img') ? null : offer.querySelector('img').getAttribute('src'),
      title: offer.querySelector('h2[data-testid=ad-title] a').structuredText.trim(),
      price: offer.querySelector('.ooa-epvm6').structuredText.trim(),
      location: offer.querySelectorAll('.e1b25f6f7').slice(-1)[0].childNodes.find(x => x.nodeType === 3)?.text,
      details: offer.querySelectorAll('ul.e1b25f6f7 li').reduce((prev, curr, index) => {
        if(index < listLabels.length) {
          prev[listLabels[index]] = curr.structuredText.trim();
        }
        return prev;
      }, {})
    })});
    return offers;
  });
}
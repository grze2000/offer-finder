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
  'Rok produkcji',
  'Przebieg',
  'Pojemność',
  'Rodzaj paliwa',
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
    .map(offer => ({
      id: offer.getAttribute('id'),
      url: offer.querySelector('h2[data-testid=ad-title] a').getAttribute('href'),
      image: !offer.querySelector('img') ? null : offer.querySelector('img').getAttribute('src'),
      title: offer.querySelector('h2[data-testid=ad-title] a').structuredText.trim(),
      price: offer.querySelector('.ooa-epvm6').structuredText.trim(),
      location: offer.querySelector('.e1b25f6f7').structuredText.trim(),
      details: offer.querySelectorAll('.e1b25f6f7').reduce((prev, curr, index) => {
        prev[index < listLabels.length ? listLabels[index] : 'Inne'] = curr.structuredText.trim()
        return prev;
      }, {})
    }));
    return offers;
  });
}
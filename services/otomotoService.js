const { parse } = require('node-html-parser');
const axios = require('axios');

const setSortingType = urlString => {
  const url = new URL(urlString);
  const params = new URLSearchParams(url.search);
  params.set('search[order]', 'created_at_first:desc');
  url.search = params.toString();
  return url.toString();
}

exports.setSortingType = setSortingType;

exports.getLastOfferID = async url => {
  const root = parse((await axios.get(setSortingType(url))).data);
  const lastOfferID = root.querySelector('.offer-item').getAttribute('data-ad-id');
  return new Promise((resolve, reject) => {
    resolve(lastOfferID);
  });
}

exports.getNewOffers = (url, lastOfferID) => {
  return axios.get(setSortingType(url)).then(res => {
    const root = parse(res.data);
    const offers = root.querySelectorAll('.offer-item').filter(offer => offer.getAttribute('data-ad-id') > lastOfferID)
    .map(offer => ({
      id: offer.getAttribute('data-ad-id'),
      url: offer.getAttribute('data-href'),
      image: offer.querySelector('.offer-item__photo-link img').getAttribute('data-srcset') ? 
        offer.querySelector('.offer-item__photo-link img').getAttribute('data-srcset').split(' ')[0] :
        offer.querySelector('.offer-item__photo-link img').getAttribute('data-src'),
      title: offer.querySelector('.offer-title__link').structuredText.trim(),
      price: offer.querySelector('.offer-price__number').structuredText.trim(),
      location: offer.querySelector('.ds-location-city').text,
      details: offer.querySelectorAll('.ds-params-block li').reduce((prev, curr) => {
        prev[curr.getAttribute('data-code')] = curr.structuredText.trim()
        return prev;
      }, {})
    }));
    return offers;
  });
}
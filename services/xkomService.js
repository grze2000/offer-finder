const { parse } = require('node-html-parser');
const axios = require('axios');
const { supportedUrls } = require('../supportedSites');

exports.getNewOffer = () => {
  return axios.get(supportedUrls[0]).then(res => {
    const root = parse(res.data);
    const offer = {
      title: root.querySelector('.sc-1bker4h-4').text,
      description: root.querySelector('.sc-8c7p9j-1').text,
      url: supportedUrls[0],
      image: root.querySelector('.jiiyfe-0 .sc-1tblmgq-1').getAttribute('src'),
      regularPrice: root.querySelector('.sc-8c7p9j-3').text,
      price: root.querySelector('.sc-8c7p9j-2').text,
    }
    return offer;
  });
}
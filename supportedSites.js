const otomotoService = require('./services/otomotoService');
const mkmotorsService = require('./services/mkmotorsService');

exports.supportedSites = {
  'www.otomoto.pl': otomotoService,
  'mk-motors.com.pl': mkmotorsService
}

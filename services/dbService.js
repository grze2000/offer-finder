const Server = require('../models/Server');
const { ValidationError } = require('../helpers/helpers');

exports.setChannel = (serverID, channelID, cb) => {
  Server.findOne({serverID: serverID}, (err, data) => {
    if(err) return cb(err);
    
    if(data) {
      data.channelID = channelID;
      data.save(err => {
        if(err) return cb(err);
      });
    } else {
      Server.create({serverID: serverID, channelID: channelID}, err => {
        if(err) return cb(err);
      });
    }
    console.log(`[${new Date().toLocaleString()}] Set channel ${channelID} on guild ${serverID}`);
    return cb(null);
  });
}

exports.addUrl = (serverID, channelID, url, lastOfferID) => {
  return Server.findOne({serverID: serverID}).then(data => {
    if(data) {
      data.urls.push({
        url: url,
        lastID: lastOfferID
      });
      return data.save();
    } else {
      return Server.create({
        serverID: serverID,
        channelID: channelID,
        urls: [{
          url: url,
          lastID: lastOfferID
        }]
      });
    }
  });
}

exports.getUrls = serverID => {
  return Server.findOne({serverID: serverID}).then(data => data.urls.map(url => url.url));
}

exports.urlExists = (serverID, url) => {
  return Server.findOne({serverID: serverID, 'urls.url': url }).then(exists => !!exists);
}

exports.deleteUrl = (serverID, urlIndex) => {
  return Server.findOne({serverID: serverID}).then(server => {
    if(urlIndex > server.urls.length || urlIndex < 1) {
      throw new ValidationError('Niepoprawne ID linku!');
    }
    server.urls[urlIndex-1].remove();
    return server.save();
  });
}
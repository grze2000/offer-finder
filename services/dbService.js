const Server = require('../models/Server');

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

exports.addUrl = (serverID, channelID, url, lastOfferID) => new Promise((resolve, reject) => {
  Server.findOne({serverID: serverID}).then(data => {
    if(data) {
      data.urls.push({
        url: url,
        lastID: lastOfferID
      });
      data.save().then(() => resolve()).catch(err => reject(err));
    } else {
      Server.create({
        serverID: serverID,
        channelID: channelID,
        urls: [{
          url: url,
          lastID: lastOfferID
        }]
      }).then(() => resolve()).catch(err => reject(err));
    }
  }).catch(err => {
    reject(err);
  });
});
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
      })
    }
    console.log(`[${new Date().toLocaleString()}] Set channel ${channelID} on guild ${serverID}`);
    return cb(null);
  })
}
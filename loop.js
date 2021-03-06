const dbService = require('./services/dbService');
const Server = require('./models/Server');
const axios = require('axios');
const { parse } = require('node-html-parser');
const Discord = require('discord.js');
const { supportedSites, supportedUrls } = require('./supportedSites');
const xkomService = require('./services/xkomService');

exports.loop = async client => {
  try {
    const servers = await Server.find({});

    for(const server of servers) {
      const channel = await client.channels.fetch(server.channelID);
      if(!channel) continue;

      for(const url of server.urls) {;
        const websitePattern = /^((?:http|https):\/\/((?:www\.)?[a-zA-Z0-9.-]+\.(?:pl|com)).*)$/g;
        const website = websitePattern.exec(url.url);

        if(Object.keys(supportedSites).includes(website[2])) {
          const newOffers = await supportedSites[website[2]].getNewOffers(url.url, url.lastID);
          newOffers.forEach(offer => {
            let embed = new Discord.MessageEmbed()
              .setColor('#0071ce')
              .setTitle(offer.title)
              .setDescription(`W serwisie ${website[2]} pojawiło się nowe ogłoszenie!`)
              .setURL(offer.url)
              .attachFiles(new Discord.MessageAttachment(`./assets/logos/${website[2].replace('www.', '')}.png`, 'image.png'))
              .setImage(offer.image)
              .setThumbnail('attachment://image.png')
              .addFields(
                { name: 'Cena', value: offer.price, inline: true },
                { name: 'Lokalizacja', value: offer.location, inline: true },
                { name: 'Rok produkcji', value: offer.details.year, inline: true },
                { name: 'Przebieg', value: offer.details.mileage, inline: true },
                { name: 'Pojemność', value: offer.details.engine_capacity, inline: true },
                { name: 'Rodzaj paliwa', value: offer.details.fuel_type, inline: true }
              )
              .setAuthor(website[2], 'attachment://image.png')
              .setFooter(website[2], 'attachment://image.png')
              .setTimestamp(new Date)
            channel.send(embed);
          });

          if(newOffers.length)
            url.lastID = newOffers[0].id;
        }
      }
      server.save(err => {
        if(err) throw err;
      });
    }
  } catch(err) {
    console.log("🚀 ~ file: loop.js ~ line 50 ~ err", err);
  }
};

const xkomLoop = async (client) => {
  try {
    const servers = await Server.find({});
    const offer = await xkomService.getNewOffer();

    for(const server of servers) {
      const channel = await client.channels.fetch(server.channelID);
      if(!channel) continue;

      for(const url of server.urls) {;
        const websitePattern = /^((?:http|https):\/\/((?:www\.)?[a-zA-Z0-9.-]+\.(?:pl|com)).*)$/g;
        const website = websitePattern.exec(url.url);

        if(supportedUrls[0] === website[1]) {
          let embed = new Discord.MessageEmbed()
            .setColor('#0071ce')
            .setTitle(offer.title)
            .setDescription(offer.description)
            .setURL(offer.url)
            .attachFiles(new Discord.MessageAttachment(`./assets/logos/${website[2].replace('www.', '')}.jpg`, 'image.jpg'))
            .setImage(offer.image)
            .setThumbnail('attachment://image.jpg')
            .addFields(
              { name: 'Cena regularna', value: offer.regularPrice, inline: true },
              { name: 'Cena promocyjna', value: offer.price, inline: true },
            )
            .setAuthor(website[2], 'attachment://image.jpg')
            .setFooter(website[2], 'attachment://image.jpg')
            .setTimestamp(new Date)
          channel.send(embed);
        }
      }
    }
    const now = new Date();
    let millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0, 0) - now;
    if(millisTill10 < 0) {
      millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0, 0) - now;
    }
    if(millisTill10 < 0) {
      millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 10, 0, 0, 0) - now;
    }
    setTimeout(() => xkomLoop(client), millisTill10);
  } catch(err) {
    console.log("🚀 ~ file: loop.js ~ line 102 ~ err", err);
  }
}

exports.xkomLoop = xkomLoop;
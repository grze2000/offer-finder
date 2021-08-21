const dbService = require('../services/dbService');
const { supportedSites } = require('../supportedSites');
const Discord = require('discord.js');

exports.showHelp = message => {
  let embed = new Discord.MessageEmbed()
    .setColor('#28254F')
    .setTitle('Offer Finder')
    .setDescription('Bot informujący o nowych ogłoszeniach z popularnych serwisów ogłoszeniowych')
    .addField('\u200B', '\u200B')
    .addField('Jak to działa?', `:one: Wybierz kanał, na którym będą pojawiać się ogłoszenia\n
    :two: Dodaj link do strony z ogłoszeniami z zastosowanymi wybranymi filtrami\n
    :three: Ciesz się powiadomieniami o interesujących ofertach`)
    .addField('\u200B', '\u200B')
    .addField('Wszystkie polecenia', `**${process.env.BOT_PREFIX} channel _<kanał>_ **- ustawia kanał do wyświetlania ogłoszeń\n
    **${process.env.BOT_PREFIX} add _<url>_** - dodaje link do listy obserwowanych ogłoszeń\n
    **${process.env.BOT_PREFIX} list** - wyświetla listę obserwowanych ogłoszeń\n
    **${process.env.BOT_PREFIX} delete _<id>_** - usuwa link o podanym id z listy obserwowanych ogłoszeń`)
    .setFooter('Offer FInder')
  message.channel.send(embed);
}

exports.setChannel = message => {
  if(!message.mentions.channels.size) {
    message.channel.send('Nie wybrano kanału');
    return;
  }

  dbService.setChannel(message.guild.id, message.mentions.channels.first().id, err => {
      if(err) {
        message.channel.send('Wystąpił błąd!');
        console.log(`[${new Date().toLocaleString()}] ${err}`);
        return;
      }

      message.channel.send(`Ustawiono kanał dla ogłoszeń: <#${message.mentions.channels.first().id}>`);
    });
}

const websitePattern = /^add ((?:http|https):\/\/((?:www\.)?[a-zA-Z0-9.]+\.(?:pl|com)).*)$/g;

exports.addUrl = async message => {
  const msg = message.content.toLowerCase().replace(process.env.BOT_PREFIX+' ', '');
  const website = websitePattern.exec(msg);
  if(!website) {
    message.channel.send('Nieprawidłowy link!');
    return;
  }
  if(!Object.keys(supportedSites).includes(website[2])) {
    message.channel.send(`Offer Finder nie wspiera linków do strony ${website[2]}`);
    return;
  }
  const lastOfferID = await supportedSites[website[2]].getLastOfferID(website[1]);
  dbService.addUrl(message.guild.id, message.channel.id, website[1], lastOfferID).then(() => {
    message.channel.send('Dodano link do listy obserwowanych!');
  }).catch(err => {
    console.log(err);
    message.channel.send('Wystąpił błąd!');
  });
}
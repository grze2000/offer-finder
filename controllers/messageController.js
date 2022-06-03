const dbService = require('../services/dbService');
const { supportedSites, supportedUrls } = require('../supportedSites');
const Discord = require('discord.js');
const { numberToDiscordEmoji, ValidationError } = require('../helpers/helpers');

const websitePattern = /^add ((?:http|https):\/\/((?:www\.)?[a-zA-Z0-9.-]+\.(?:pl|com)).*)$/g;

exports.showHelp = message => {
  let embed = new Discord.MessageEmbed()
    .setColor('#0071ce')
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

exports.addUrl = async message => {
  try {
    const msg = message.content.toLowerCase().replace(process.env.BOT_PREFIX+' ', '');
    const website = websitePattern.exec(msg);
    if(!website) {
      message.channel.send('Nieprawidłowy link!');
      return;
    }
    if(!Object.keys(supportedSites).includes(website[2]) && !supportedUrls.includes(website[1])) {
      message.channel.send(`Offer Finder nie wspiera linków do strony ${website[2]}`);
      return;
    }
    if(await dbService.urlExists(message.guild.id, website[1])) {
      message.channel.send('Podany link już znajduje się na liście obserwowanych!');
      return;
    }
    const lastOfferID = Object.keys(supportedSites).includes(website[2]) ? await supportedSites[website[2]].getLastOfferID(website[1]) : null;
    await dbService.addUrl(message.guild.id, message.channel.id, website[1], lastOfferID);
    message.channel.send('Dodano link do listy obserwowanych!');
  } catch(err) {
    console.log("🚀 ~ file: messageController.js ~ line 63 ~ err", err)
    message.channel.send('Wystąpił błąd!');
  }
}

exports.listUrls = message => {
  dbService.getUrls(message.guild.id).then(urls => {
    let embed = new Discord.MessageEmbed()
      .setColor('#0071ce')
      .setTitle('Obserwowane strony')
      .setDescription(`Ilość aktualnie obserowowanych stron: **${urls.length}**
      Użyj **!of delete <id>** aby usunąć link z obserwowanych`);
    if(urls.length) {
      embed.addField(`ID \t Url\n`,
      urls.reduce((text, url, index) => {
        return text += `${numberToDiscordEmoji(index+1)} [${url.slice(0, 50)}...](${url})\n`
      }, ''));
    }
    embed.setFooter('Offer FInder');
    message.channel.send(embed);
  }).catch(err => {
    console.log("🚀 ~ file: messageController.js ~ line 81 ~ dbService.getUrls ~ err", err)
    message.channel.send('Wystąpił błąd!');
  });
}

exports.deleteUrl = message => {
  const number = /^delete ([0-9]+)$/g.exec(message.content.toLowerCase().replace(process.env.BOT_PREFIX+' ', ''));
  dbService.deleteUrl(message.guild.id, parseInt(number[1])).then(data => {
    message.channel.send('Link został usunięty z lisy obserwowanych!');
  }).catch(err => {
    message.channel.send(err instanceof ValidationError ? err.message : 'Wystąpił błąd!');
  });
}
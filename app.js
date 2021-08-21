require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const mongoose = require('mongoose');
const dbService = require('./services/dbService');
const messageController = require('./controllers/messageController');

mongoose.connect(process.env.MONGODB_URI, {useUnifiedTopology: true, useNewUrlParser: true}).then(() => {
  console.log(`[${new Date().toLocaleString()}] Conected to database`);
}).catch((err) => {
  throw `Error: ${err.message}`;
});

client.on('ready', () => {
  console.log(`[${new Date().toLocaleString()}] Logged in as ${client.user.tag}!`);
  client.user.setActivity('oferty', {type: 'WATCHING'});
})

client.on('message', message => {
  if(message.content.toLowerCase().startsWith(process.env.BOT_PREFIX) &&
    !message.author.bot &&
    message.channel.type === 'text' &&
    (message.member.hasPermission('ADMINISTRATOR') ||
    message.author.id === '588438077354278934')) {

    const commands = {
      '^help$': messageController.showHelp,
      '^channel <#[0-9]+>$': messageController.setChannel,
      '^add (http|https):\/\/.+$': messageController.addUrl
    }

    for (const [pattern, func] of Object.entries(commands)) {
      const re = new RegExp(pattern);
      if(re.test(message.content.toLowerCase().replace(process.env.BOT_PREFIX+' ', ''))) {
        return func(message);
      }
    }

    message.channel.send('Nieprawidłowa komenda. Użyj !om help aby uzyskać pomoc.');
  }
});

client.on('guildCreate', guild => {
  console.log(`[${new Date().toLocaleString()}] Added to ${guild.name}`);
});

client.on('guildDelete', guild => {
  console.log(`[${new Date().toLocaleString()}] Kicked from ${guild.name}`);
  dbService.removeServer(guild.id);
});

client.login(process.env.BOT_TOKEN);
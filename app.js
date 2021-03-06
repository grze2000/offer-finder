require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const mongoose = require('mongoose');
const dbService = require('./services/dbService');
const messageController = require('./controllers/messageController');
const { loop, xkomLoop } = require('./loop');

mongoose.connect(process.env.MONGODB_URI, {useUnifiedTopology: true, useNewUrlParser: true}).then(() => {
  console.log(`[${new Date().toLocaleString()}] Conected to database`);
}).catch((err) => {
  throw `Error: ${err.message}`;
});

client.on('ready', () => {
  console.log(`[${new Date().toLocaleString()}] Logged in as ${client.user.tag}!`);
  client.user.setActivity('oferty', {type: 'WATCHING'});
  loop(client);
  setInterval(() => { loop(client) }, 1000*60*parseInt(process.env.REFRESH_INTERVAL));
  
  const now = new Date();
  let millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0, 0) - now;
  if(millisTill10 < 0) {
    millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0, 0) - now;
  }
  if(millisTill10 < 0) {
    millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 10, 0, 0, 0) - now;
  }
  setTimeout(() => xkomLoop(client), millisTill10);
});

client.on('message', message => {
  if(message.content.toLowerCase().startsWith(process.env.BOT_PREFIX) &&
    !message.author.bot &&
    message.channel.type === 'text' &&
    (message.member.hasPermission('ADMINISTRATOR') ||
    message.author.id === '588438077354278934')) {

    const commands = {
      '^help$': messageController.showHelp,
      '^channel <#[0-9]+>$': messageController.setChannel,
      '^add (http|https):\/\/.+$': messageController.addUrl,
      '^list$': messageController.listUrls,
      '^delete ([0-9]+)$': messageController.deleteUrl
    }

    for (const [pattern, func] of Object.entries(commands)) {
      const re = new RegExp(pattern);
      if(re.test(message.content.toLowerCase().replace(process.env.BOT_PREFIX+' ', ''))) {
        return func(message);
      }
    }

    message.channel.send('Nieprawid??owa komenda. U??yj !om help aby uzyska?? pomoc.');
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
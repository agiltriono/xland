const i18n = require("../util/i18n");
const { database, timeconvert, games } = require("../util/util");
const help = require("../includes/help");
const db = database.ref("guild");
module.exports = {
  name : "messageCreate",
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;
db.child(message.guild.id).once("value", async function(data) {
      const languages = data.child("lang").val() ? data.child("lang").val() : "en";
      const prefix = data.child("prefix").val() ? data.child("prefix").val() : client.prefix;
      i18n.setLocale(languages);
      const args = message.content.slice(prefix.length).trim().split(/ +/g);
      
      const commandName = args.shift().toLowerCase();
      const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
      const helpString = commandName == "help" || commandName == "h";
      const creator = {id:message.author.id};
      const viewsend = message.guild.me.permissions.has("VIEW_CHANNEL") && message.guild.me.permissions.has("SEND_MESSAGES");
      const manages = message.guild.me.permissions.has("MANAGE_MESSAGES") && message.guild.me.permissions.has("MANAGE_CHANNELS");
      const hasPerm = viewsend && manages;

      if ((/^<@(\w|!)[0-9]*>$/).test(message.content.toString())) {
        const usermention = message.content.toString().replace(/\!/gm, '');
        const botmention = `<@${message.client.user.id}>`;
        const isBotMention = botmention.length === usermention.length && usermention === botmention;
        
        if (isBotMention && viewsend) return help(message, args, creator, true, prefix);
      }

      if (!message.content.startsWith(prefix)) return;
      if (helpString && hasPerm) { 
          return help(message, args, creator, false, prefix);
        }
      if(!command && command != helpString) return;
      if (!hasPerm) return;
      if (!client.cooldowns.has(command.help.name)) {
        client.cooldowns.set(command.help.name, new client.discord.Collection());
      }
    
      const now = Date.now();
      const timestamps = client.cooldowns.get(command.help.name);
      const cooldownAmount = ((command.help.cooldown ? command.help.cooldown : 1) || 1) * 1000;
      if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          const elapsed = timeconvert(timeLeft);
          return message.reply(i18n.__mf("common.cooldown", { 
            h: elapsed.h > 0 ? i18n.__mf("timeconvert.hour",{h: elapsed.h}) : "",
            m: elapsed.m > 0 ? i18n.__mf("timeconvert.minute",{m: elapsed.m}) : "",
            s: elapsed.s > 0 ? i18n.__mf("timeconvert.second",{s: elapsed.s}) : "",
            name: command.help.name
          }))
        }
      }
    
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
      
      try {
        
        if (command.help.category == "Games") {
          if (client.game.find(obj => obj.game.includes(command.help.name))) {
            if (client.game.find(obj => obj.guild.includes(message.guild.id) && obj.started === false)) {
              command.run(message, args, creator, client.game.find(obj => obj.guild.includes(message.guild.id) && obj.game.includes(command.help.name)), client, prefix)
            } else {
              message.reply(i18n.__("common.command.multiple"));
            }
          } else {
            client.game.push(new games(command.help.name, message.guild.id, false));
            command.run(message, args, creator, client.game.find(obj => obj.guild.includes(message.guild.id) && obj.game.includes(command.help.name)), client, prefix)
          }
        } else {
          command.run(message, args, creator, client, prefix);
        }
        
      } catch (error) {
        console.error(error);
      }
    })
  }
}
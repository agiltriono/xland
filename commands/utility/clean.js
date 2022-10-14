// node.js version 14.x.x - 16.x.x
// @param <prefix>clean (number between 1 - 100)
const { clear } = require(".././../util/util");
const i18n = require(".././../util/i18n");

module.exports.help = {
  name: "clean",
  aliases: ["cl","clear","delete-message"],
  cooldown: 3,
  usage: "<5-100 | all>",
  category: "Utility",
  permissions: ["MANAGE_MESSAGES","ADMINISTRATOR"],
  description: "utility.clean.description"
}
module.exports.run = async (msg, args) => {
  if (!msg.guild.me.permissions.has("MANAGE_MESSAGES")) return msg.reply(i18n.__("common.command.permissions.missing",{perm:"`MANAGE_MESSAGES`"}));
  if (!msg.member.permissions.has("ADMINISTRATOR")) return msg.reply(i18n.__("common.command.permissions.denied"));
   const arg = msg.content.slice(msg.client.prefix.length).trim().split(/ +/g);
   const commandName = arg.shift().toLowerCase();
   const command = msg.client.commands.get(commandName) || msg.client.commands.get(msg.client.aliases.get(commandName));
   const number = /^[1-9][0-9]?$|^100$/;
   const character = /[a-zA-Z]+/;
 try {
     
    if (!args.length){
      msg.channel.send(i18n.__mf("common.command.helper.current", { prefix : msg.client.prefix, command : command.help.name })).then(msg => {
        clear(msg, 2000)
      })
    } else if (character.test(args[0]) && args[0].toLowerCase() === "all") {
      var message = await msg.channel.messages.fetch()
      var len = message.size;
      if (len == 0) return msg.reply(i18n.__("common.notAvailable"));
      var progress = 0
      var start = Date.now()
      message.forEach(async(m) => {
        await m.delete()
        progress = progress + 1
      })
      var startwait = 0
      var maxwait = 65;
      const interval = setInterval(async() => {
        startwait = startwait +1
        if (progress >= len) {
          clearInterval(interval)
          const end = Date.now()
          const ended = (end - start);
          await msg.channel.send(i18n.__mf("utility.clean.command.success", { amount: message.size, time: ended.toFixed(1) })).then(msg => {
             clear(msg, 5000)
          })
        } else if (startwait >= maxwait) return clearInterval(interval);
      }, 1000)
    } else if (number.test(args[0])) {
      const amount = parseInt(args[0]);
       
      await msg.channel.bulkDelete(amount).then(done => {
        const response = msg.client.ws.ping;
        msg.channel.send(i18n.__mf("utility.clean.command.success", { amount: amount, time: response })).then(msg => {
           clear(msg, 5000)
        })
      })
    } else {
      return msg.reply(i18n.__("common.command.invalid"))
    }
  } catch (error) {
    msg.channel.send(i18n.__("utility.clean.command.error.limitation")).then(msg => {
      clear(msg, 5000)
    })
  }
}
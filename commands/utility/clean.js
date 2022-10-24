// node.js version 14.x.x - 16.x.x
// @param <prefix>clean (number between 1 - 100)
const { embeds, clear } = require(".././../util/util");
const i18n = require(".././../util/i18n");

module.exports.help = {
  name: "clean",
  aliases: ["cl"],
  cooldown: 30,
  usage: "<5-100 | all>",
  category: "Utility",
  permissions: ["MANAGE_MESSAGES","ADMINISTRATOR"],
  description: "utility.clean.description"
}
module.exports.run = async (msg, args, creator, client, prefix) => {
  await msg.delete()
  if (!msg.guild.me.permissions.has("MANAGE_MESSAGES")) return msg.reply(embeds(i18n.__("common.command.permissions.missing",{perm:"`MANAGE_MESSAGES`"}))).then(m=>clear(m,3000));
  if (!msg.member.permissions.has("ADMINISTRATOR")) return msg.reply(embeds(i18n.__("common.command.permissions.denied"))).then(m=>clear(m,3000));
  const arg = msg.content.slice(prefix).trim().split(/ +/g);
  const commandName = arg.shift().toLowerCase();
  const command = msg.client.commands.get(commandName) || msg.client.commands.get(msg.client.aliases.get(commandName));
  const number = /^[1-9][0-9]?$|^100$/;
  const character = /[a-zA-Z]+/;
  const message = await msg.channel.messages.fetch()
  if (!args.length){
    msg.channel.send(embeds(i18n.__mf("common.command.helper.current", { prefix : prefix, command : command.help.name }))).then(m => clear(m, 2000))
  } else if (character.test(args[0]) && args[0].toLowerCase() === "all") {
    if (message.size == 0) return msg.reply(embeds("❌ Gak ada chat untuk di hapus!")).then(m=>clear(m,3000));
    msg.channel.send({embeds:[{
      color: "#ff6961",
      title: "PERINGATAN PENGHAPUSAN MASAL",
      description: `**JANGAN KIRIM PESAN DI CHANNEL ${msg.channel.id} SELAMA PENGHAPUSAN!**\n\n*pembersihan dimulai setelah ⏰10 detik.`
    }]}).then(m=> {
      clear(m, 10000)
      purge(msg, "all", 0, Date.now())
    })
  } else if (number.test(args[0])) {
    if (message.size == 0) return msg.reply(embeds("❌ Gak ada chat untuk di hapus!")).then(m=>clear(m,3000));
    purge(msg, parseInt(args[0]), 0, Date.now())
  } else {
    return msg.reply(i18n.__("common.command.invalid")).then(m => clear(m, 3000))
  }
}
//(Message, Message.messages.fetch, Date.now(), Date.now())
async function purge (msg, amount, removed, startdate) {
  const start = startdate || Date.now()
  const message = await msg.channel.messages.fetch();
  const total = amount || message.size;
  let progress = 0
  message.forEach(async m => {
    if (amount != "all") {
      if (amount == progress) {
        let ended = (Date.now() - start)
        msg.channel.send(embeds(i18n.__mf("utility.clean.command.success", { amount: (removed)+progress, time: ended.toFixed(1) }))).then(m => clear(m, 3000))
        return;
      } else if (message.size === progress) {
        return recursive(msg, amount, (removed)+progress, start)
      }
    } else if (amount === "all" && message.size === progress) {
        return recursive(msg, amount, (removed)+progress, start)
    }
    progress++;
    await m.delete()
  })
}
async function recursive(msg, amount, removed, start) {
  const message = await msg.channel.messages.fetch()
  if (message.size === 0) {
    let ended = (Date.now() - start)
    msg.channel.send(embeds(i18n.__mf("utility.clean.command.success", { amount: removed, time: ended.toFixed(1) }))).then(m => clear(m, 3000))
  } else {
    purge(msg, amount, removed, start)
  }
}
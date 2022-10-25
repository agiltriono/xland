const { embeds, clear } = require(".././../util/util");
const i18n = require(".././../util/i18n");

module.exports.help = {
  name: "clean",
  aliases: ["cl"],
  cooldown: 3,
  usage: "<5-100 | all>",
  category: "Utility",
  permissions: ["MANAGE_MESSAGES","ADMINISTRATOR"],
  description: "utility.clean.description"
}
module.exports.run = async (msg, args, creator, client, prefix) => {
  await clear(msg, 1000)
  if (!msg.guild.me.permissions.has("MANAGE_MESSAGES")) return msg.channel.send(embeds(i18n.__("common.command.permissions.missing",{perm:"`MANAGE_MESSAGES`"}))).then(m=>clear(m,3000));
  if (!msg.member.permissions.has("ADMINISTRATOR")) return msg.channel.send(embeds(i18n.__("common.command.permissions.denied"))).then(m=>clear(m,3000));
  if (!args.length) return msg.channel.send(embeds(i18n.__mf("common.command.helper.current", { prefix : prefix, command : "clean" }))).then(m => clear(m, 2000))
  const number = /^[1-9][0-9]?$|^100$/;
  const character = /[a-zA-Z]+/;
  const message = await msg.channel.messages.fetch()
  if (character.test(args[0]) && args[0].toLowerCase() === "all") {
    if (message.size == 0) return msg.channel.send(embeds("❌ Gak ada chat untuk di hapus!")).then(m=>clear(m,3000));
    return msg.channel.send({embeds:[{
      color: "#ff6961",
      title: "PERINGATAN PENGHAPUSAN MASAL",
      description: `**Pembersihan dimulai setelah ⏰15 detik.**`
    }]}).then(async m => {
      await clear(m, 15000)
      return purge(msg, "all", 0, Date.now())
    })
  } else if (number.test(args[0])) {
    if (message.size == 0) return msg.channel.send(embeds("❌ Gak ada chat untuk di hapus!")).then(m=>clear(m,3000));
    return purge(msg, parseInt(args[0]), 0, Date.now())
  } else {
    return msg.channel.send(i18n.__("common.command.invalid")).then(m => clear(m, 3000))
  }
}
async function purge (msg, amount, removed, startdate) {
  const start = startdate || Date.now()
  const message = await msg.channel.messages.fetch();
  let progress = 0
  for(let i = 0; i < message.size;i++) {
    progress++;
    await message.at(i).delete()
    if (amount != "all") {
      if (amount == progress) {
        let ended = (Date.now() - start)
        msg.channel.send(embeds(i18n.__mf("utility.clean.command.success", { amount: (removed)+progress, time: ended.toFixed(1) }))).then(m => clear(m, 3000))
        break;
      } else if (message.size === progress) {
          recursive(msg, amount, (removed)+progress, start)
          break;
      }
    }
    if (amount === "all" && message.size === progress) {
        recursive(msg, amount, (removed)+progress, start)
        break;
    }
  }
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
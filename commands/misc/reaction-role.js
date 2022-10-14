const i18n = require(".././../util/i18n");
const { getmsg, clear, remove } = require('.././../util/util');
module.exports.help = {
  name: "reaction-role",
  aliases: ["rr"],
  cooldown: 10,
  category: "Misc",
  usage: "",
  permissions: ["SEND_MESSAGES","EMBED_LINKS","MANAGE_MESSAGES"],
  description: "misc.rr.description"
}

exports.run = async (msg, args, creator) => {
  if (!msg.member.permissions.has("MANAGE_MESSAGES")) return msg.reply(i18n.__("common.command.permissions.denied"));
  if (!msg.guild.me.permissions.has("MANAGE_MESSAGES") && !msg.guild.me.permissions.has("EMBED_LINKS") && !msg.guild.me.permissions.has("SEND_MESSAGES")) return msg.reply(i18n.__mf("common.command.permissions.missing",{perm: "`SEND_MESSAGES`,`MANAGE_MESSAGES`,`EMBED_LINKS`"}));
  var messages = [];
  var description = null
  var fields = []
  var desc = "desc";
  var react = "react";
  var send = "send";
  var content = "";
  const embed = {
    embeds : [{
      description: i18n.__mf("misc.rr.info",{
        description: `${description ? description.replace(/\\n/g, "\n") : "`EMPTY`"}`,
        field: `${fields.length ? fields.map(n=> `Emoji: ${n.name} => Role: ${n.value}`).join("\n") : "`EMPTY`"}`
      })
    }]
  }
  function update() {
    getmsg(msg, messages[0]).then(m => {
      m.edit({
        embeds : [{
          description: i18n.__mf("misc.rr.info",{
            description: `${description ? description.replace(/\\n/g, "\n") : "`EMPTY`"}`,
            field: `${fields.length ? fields.map(n=> `Emoji: ${n.name} => Role: ${n.value}`).join("\n") : "`EMPTY`"}`
          })
        }]
      })
    })
  }
  msg.channel.send(embed).then(m => {
    messages.push(m.id)
  })
  const filter = m => m.content && m.author.id === creator.id;
  const c = msg.channel.createMessageCollector({
    filter,
    time: 60000
  })
  c.on("collect", async (m) => {
    content = m.content;
    clear(m)
    if (content.toLowerCase().startsWith(desc)) {
      const d = content.replace(/\n/g, "\\n").slice(desc.length).trim().split(/ +/g);
      if (!d.length) return;
      description = d.join(" ");
      update()
      c.resetTimer()
    } else if (content.toLowerCase().startsWith(react)) {
      const r = content.slice(react.length).trim().split(/ +/g);
      if (!r.length) return;
      fields.push({
        name: `> ${r[0]}`,
        value: r[1]
      })
      update()
      c.resetTimer()
    } else if (content.toLowerCase().startsWith(send)) {
      const s = content.slice(send.length).trim().split(/ +/g);
      const channel = msg.client.channels.cache.get(s[0].replace(/[\\<>@#&!]/g, ""))
      if (!channel) return;
      if (!description) return;
      if (!fields.length) return;
      const ms = await channel.send({
        embeds: [{
          description: description.replace(/\\n/g, "\n"),
          fields: fields
        }]
      })
      fields.forEach(async (n) => {
        await ms.react(n.name.replace("> ", ""))
      })
      c.stop()
    }
  })
  c.on("end", (collected, reason) => {
    remove(msg, messages[0])
  })
}
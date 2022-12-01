const { database, clear, embeds } = require(".././../util/util")
const db = database.ref("guild")

module.exports.help = {
    name: "afk-channel",
    aliases: ["set-afk"],
    usage:"",
    category: "AFK",
    permissions: ["ADMINISTRATOR","MANAGE_GUILD"],
    description: "Set afk channel"
}

module.exports.run = async (msg, args, creator, prefix) => {
  await msg.delete()
  const permis = [
    (msg.member.permissions.has("ADMINISTRATOR")),
    (msg.member.permissions.has("MANAGE_GUILD")),
    (creator.id === msg.guild.ownerId)
  ].filter(u=>u.toString() != "false")
  if(permis.length === 0) return;
  if (!msg.guild.me.permissions.has("SEND_MESSAGES")) return msg.channel.send(embeds("❌ Aku butuh permissions `SEND_MESSAGES`")).then(m=> clear(m, 3000));
  if(args.length === 0) return msg.channel.send(embeds(`⚠️ Salah Perintah!`)).then(m=> clear(m, 2000));
  const guild = msg.guild
  const input = args.join("").trim().replace(/[\\<>@#&!]/gm, "")
  const ch = guild.channels.cache.get(input)
  if (ch) {
    if(ch.type != "GUILD_TEXT") return msg.channel.send(embeds(`⚠️ Salah Perintah!`)).then(m=> clear(m, 2000));
    await db.child(guild.id).child("afk").update({channel:ch.id})
    return await msg.channel.send(embeds(`✅ AFK Channel update!`))
  } else {
    return await msg.channel.send(embeds(`⚠️ Salah Perintah!`)).then(m=> clear(m, 2000));
  }
}
const { database, clear, embeds, dev_id } = require(".././../util/util")
const db = database.ref("guild")

module.exports.help = {
    name: "server-leave",
    aliases: ["guild-leave","gl"],
    usage:"",
    category: "Developer",
    permissions: ["ADMINISTRATOR","MANAGE_GUILD"],
    description: "Leave from server"
}

module.exports.run = async (msg, args, creator, prefix) => {
  await msg.delete
  if (creator.id != dev_id) return msg.channel.send(embeds("⚠️ Access denied!")).then(m=> clear(m, 3000));
  if (!msg.guild.me.permissions.has("SEND_MESSAGES")) return msg.channel.send(embeds("❌ Aku butuh permissions `SEND_MESSAGES`")).then(m=> clear(m, 3000));
  const guild = msg.guild
  db.once("value", async(s) => {
    const server = s.child(guild.id)
    if(server.exists()) {
      await db.child(guild.id).remove()
    }
    await guild.leave()
  })
}
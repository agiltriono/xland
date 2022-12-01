const { database, clear, embeds } = require(".././../util/util")
const db = database.ref("guild")

module.exports.help = {
    name: "afk",
    aliases: ["away-from-keyboard"],
    usage:"",
    category: "AFK",
    permissions: ["ADMINISTRATOR","MANAGE_GUILD"],
    description: "Set afk channel"
}

module.exports.run = async (msg, args, creator, prefix) => {
  if (!msg.guild.me.permissions.has("SEND_MESSAGES")) return msg.channel.send(embeds("❌ Aku butuh permissions `SEND_MESSAGES`")).then(m=> clear(m, 3000));
  const guild = msg.guild
  db.child(guild.id).once("value", async(s) => {
    const afk = s.child("afk")
    const afkChannel = msg.guild.channels.cache.get(afk.child("channel").val())
    if (!afkChannel) return;
    const input = args.join(" ").trim()
    const isAfk = afk.child("member").child(creator.id)
    if(input === "remove") {
      if(!isAfk.exists()) return await msg.reply(`Your status is not AFK!`);
      await db.child(guild.id).child("afk").child("member").child(creator.id).remove();
      return await msg.reply(embeds(`Your AFK status are removed!`));
    } else {
      if (isAfk.exists()) return await msg.reply(`Your status is already AFK!`);
      await db.child(guild.id).child("afk").child("member").child(creator.id).update({reason:input})
      return await msg.reply(embeds(`Your AFK is now set to: ${input || "AFK"}`))
    }
  })
}
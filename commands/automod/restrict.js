const { database, clear, embeds, isNumber } = require(".././../util/util");
const db = database.ref("guild");
module.exports.help = {
    name: "restrict",
    aliases: ["strict"],
    usage:"start AWALAN CHANNEL_ID | min ANGKA CHANNEL_ID | delete CHANNEL_ID",
    category: "Automod",
    permissions: ["ADMINISTRATOR","MANAGE_GUILD"],
    description: "Restrict Channel with limit and start with specific word"
}
// strict start CHANNEL String
// strict min CHANNEL Number
// restrict delete CHANNEL
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
  const command = args[0]
  if (command === "qr_only") {
    const channel = args[1]
    if(!isNumber(args[1])) return msg.channel.send(embeds("⚠️ Argument tidak valid!"));
    await db.child(guild.id).child("strict").child(channel).set({
      type: "qr_only"
    });
    await msg.channel.send(embeds(`✅ Restricted channel <#${args[1]}> quotes and riddle only!`))
  } else if (command === "attach_only") {
    const channel = args[1]
    if(!isNumber(args[1])) return msg.channel.send(embeds("⚠️ Argument tidak valid!"));
    await db.child(guild.id).child("strict").child(channel).set({
      type: "attach_only"
    });
    await msg.channel.send(embeds(`✅ Restricted channel <#${args[1]}> attachment only!`))
  } else if (command === "start") {
    const array = [...args]
    array.shift()
    const channel = [...array].splice(0,1).join(" ")
    const awal = [...array].splice(1, array.length).join(" ")
    if (awal == "") return msg.channel.send(embeds("⚠️ Cantumkan awalan terlebih dahulu!"));
    if (channel == "") return msg.channel.send(embeds("⚠️ Harap tentukan channel!"));
    if (isNumber(awal) || !isNumber(channel)) return msg.channel.send(embeds("⚠️ Argument tidak valid!"));
    await db.child(guild.id).child("strict").child(channel).set({
      type: "start",
      start : awal
    });
    await msg.channel.send(embeds(`✅ Restricted channel <#${channel}> dengan awalan \`${awal}\``));
  } else if (command === "min") {
    const array = [...args]
    array.shift()
    const channel = [...array].splice(0,1).join(" ")
    const min = [...array].splice(1, array.length).join(" ")
    if (min === "") return msg.channel.send(embeds("⚠️ Cantumkan jumlah karakter terlebih dahulu!"));
    if (channel === "") return msg.channel.send(embeds("⚠️ Harap tentukan channel!"));
    if (!isNumber(min) || !isNumber(channel)) return msg.channel.send(embeds("⚠️ Argument tidak valid!")); 
    await db.child(guild.id).child("strict").child(channel).set({
      type: "min",
      min : parseInt(min)
    });
    await msg.channel.send(embeds(`✅ Restricted channel <#${channel}> dengan minimal karakter \`${min}\``));
  } else if (command === "delete") {
    db.child(guild.id).once("value", async(s)=> {
      const strict = s.child("strict")
      const ch = strict.child(args[1])
      if(!isNumber(args[1])) return msg.channel.send(embeds("⚠️ Argument tidak valid!"));
      if(!ch.exists()) return msg.channel.send(embeds("⚠️ Channel tidak ditemukan!"));
      await db.child(guild.id).child("strict").child(args[1]).remove()
      await msg.channel.send(embeds(`🗑 Restricted channel <#${args[1]}> di hapus!`))
    })
  } else {
    return msg.channel.send(embeds("⚠️ Argument di perlukan!"));
  }
};
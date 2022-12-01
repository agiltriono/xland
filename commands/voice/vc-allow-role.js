const { database, clear, embeds } = require(".././../util/util");
const db = database.ref("guild");
module.exports.help = {
    name: "vc-allow-role",
    aliases: ["vc-role"],
    usage:"add | del | list | help",
    category: "Voice",
    permissions: ["SEND_MESSAGES"],
    description: "Buat Daftar Trusted Role untuk creator voice channel."
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
  const regex = /^<@&?[0-9]*>$/;
  const guild = msg.guild
  // LIST
  if (args[0] != undefined && args[0].toLowerCase() === "list") {
    // list
    db.child(guild.id).once("value", async (s) =>{
      const src = s.child("voice").child("vc_allow_role")
      const list = src.exists() ? src.val().trim().split(",") : []
      if (list.length === 0) return await msg.channel.send(embeds(`⚠️ List empty!`));
      await msg.channel.send(embeds(`**__ALLOWED ROLE__**\n${list.map(role=>`<@&${role}> | ID: \`${role}\``).join("\n")}`))
    })
    // ADD ROLE
  } else if (args[0] != undefined && args[0].toLowerCase() === "add") {
    // add
    if (args[1] === undefined) return await msg.channel.send(embeds(`⚠️ Argument cannot be empty!`));
    if (!regex.test(args[1].trim())) return await msg.channel.send(embeds(`⚠️ Invalid role! please mention a role!`));
    let role = args[1].trim().replace(/[\\<>@#&!]/gm, "")
    db.child(guild.id).once("value", async (s) =>{
      const src = s.child("voice").child("vc_allow_role")
      const list = src.exists() ? src.val().trim().split(",") : []
      if (list.includes(role)) return await msg.channel.send(embeds(`⚠️ **${role}** already exist.\n\nCurrent list :\n${list.join(",")}`));
      list.push(role)
      await db.child(msg.guild.id).child("voice").update({vc_allow_role:list.toString()})
      await msg.channel.send(embeds(`✅ List updated.\n🆕 <@&${role}>`))
    })
    // DELETE ROLE
  } else if(args[0] != undefined && args[0].toLowerCase() === "del") {
    // delete
    if (args[1] === undefined) return await msg.channel.send(embeds(`⚠️ Argument cannot be empty!`));
    if (!regex.test(args[1].trim())) return await msg.channel.send(embeds(`⚠️ Invalid role! please mention a role!`));
    let role = args[1].trim().replace(/[\\<>@#&!]/gm, "")
    db.child(guild.id).once("value", async (s) =>{
      const src = s.child("voice").child("vc_allow_role")
      const list = src.exists() ? src.val().trim().split(",") : []
      if (list.length === 0) return await msg.channel.send(embeds(`⚠️ List empty!.`));
      if (!list.includes(role)) return await msg.channel.send(embeds(`⚠️ ID <@&${role}> not exists!`));
      let newList = list.filter(l=> !l.includes(role))
      await db.child(msg.guild.id).child("voice").update({vc_allow_role:newList.toString()})
      await msg.channel.send(embeds(`✅ List updated.\n❌ <@&${role}>`))
    })
    // HELP
  } else if (args[0] != undefined && args[0].toLowerCase() === "help") {
    await msg.channel.send(embeds(`🛠 **__Allowed Role__**\n\nAdd role :\n \`${prefix}vc-role add MENTION\`\nDelete role :\n \`${prefix}vc-role del MENTION\`\nShow list :\n \`${prefix}vc-role list\`\n\n*NOTE: Role that doesn't exist on the list will be blocked by default in the voice applied for (lock, unlock, etc..).*`));
  } else {
    await msg.channel.send(embeds(`⚠️ Wrong command! Try again with \`vc-role help\``))
  }
};
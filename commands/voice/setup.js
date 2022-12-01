const { MessageActionRow, MessageButton } = require("discord.js");
const { database, embeds, clear, color } = require(".././../util/util"); 
const db = database.ref("guild");

module.exports.help = {
    name: "vc-setup",
    aliases: ["set-vc"],
    usage:"",
    category: "Voice",
    permissions: ["ADMINISTRATOR","MANAGE_GUILD","SEND_MESSAGES"],
    description: "Instantly create Auto Channel in the server."
}

module.exports.run = async function(msg, args, creator, prefix) {
  await msg.delete()
  // ID_CHANNEL
  const permis = [
    (msg.member.permissions.has("ADMINISTRATOR")),
    (msg.member.permissions.has("MANAGE_GUILD")),
    (creator.id === msg.guild.ownerId)
  ].filter(u=>u.toString() != "false")
  if(permis.length === 0) return;
  if (!msg.guild.me.permissions.has("SEND_MESSAGES")) return msg.channel.send(embeds("❌ Aku butuh permissions `SEND_MESSAGES`")).then(m=> clear(m, 3000));
  /* FREE ONLY
    claim, rename, limit, block, unblock, lock, unlock, kick, info
    <:xl_claim:1045006540693848155>
    <:xl_rename:1045006478119010314>
    <:xl_lock:1045006371508203570>
    <:xl_unlock:1045006285810188338>
    <:xl_limit:1045006174954721440>
    <:xl_kick:1045006033120145478>
    <:xl_unblock:1045005907718848592>
    <:xl_block:1045005779301847141>
    <:xl_info:1045005515190710392>
  */
  const name = [
    {id: "claim", emoji: "<:xl_claim:1045006540693848155>",description:"Klaim Ownership channel."},
    {id: "rename", emoji: "<:xl_rename:1045006478119010314>",description:"Ganti nama Voice Channel."},
    {id: "limit", emoji: "<:xl_limit:1045006174954721440>",description:"Setel batas maksimal jumlah member."},
    {id: "block", emoji: "<:xl_block:1045005779301847141>",description:"Tambahkan member ke daftar Blocked Member."},
    {id: "unblock", emoji: "<:xl_unblock:1045005907718848592>",description:"Hapus member dari daftar Blocked Member."},
    {id: "lock", emoji: "<:xl_lock:1045006371508203570>", description:"Kunci channel."},
    {id: "unlock", emoji: "<:xl_unlock:1045006285810188338>",description:"Buka kunci channel."},
    {id: "kick", emoji: "<:xl_kick:1045006033120145478>",description:"Kick member dari channel."},
    {id: "info", emoji: "<:xl_info:1045005515190710392>",description:"Lihat info tentang channel."}
  ]
  const button = name.map(name => {
    return new MessageButton().setCustomId("vc_interface_"+name.id)
    //.setLabel(name.id.capitalize())
    .setEmoji(name.emoji)
    .setStyle("SECONDARY")
    //.setDisabled(true)
  })
  function chunk(obj, i) {
    let chunks = [];
    while(obj.length){
      chunks.push({
        type: 1,
       components: obj.splice(0, i)
      });
    }
    return chunks;
  }
  const row = chunk(button, 5)
  // XLAND VC
  const cat = await msg.guild.channels.create("XLAND VC",{
    type: "GUILD_CATEGORY",
    permissionOverwrites: [
      {
        id: msg.guild.roles.everyone.id,
        deny: ["VIEW_CHANNEL","SEND_MESSAGES","READ_MESSAGE_HISTORY","ADD_REACTIONS","EMBED_LINKS","ATTACH_FILES","USE_EXTERNAL_EMOJIS","USE_APPLICATION_COMMANDS","SEND_TTS_MESSAGES"]
      }
    ]
  })
  const tc = await msg.guild.channels.create("🛠-interface",{
    type: "GUILD_TEXT",
    parent: cat,
    permissionOverwrites: [
      {
        id: msg.guild.roles.everyone.id,
        deny: ["VIEW_CHANNEL","SEND_MESSAGES","READ_MESSAGE_HISTORY","ADD_REACTIONS","EMBED_LINKS","ATTACH_FILES","USE_EXTERNAL_EMOJIS","USE_APPLICATION_COMMANDS","SEND_TTS_MESSAGES"]
      }
    ]
  })
  const vc = await msg.guild.channels.create("➕ Creator",{
    type: "GUILD_VOICE",
    parent: cat,
    permissionOverwrites: [
      {
        id: msg.guild.roles.everyone.id,
        deny: ["VIEW_CHANNEL","SEND_MESSAGES","READ_MESSAGE_HISTORY","ADD_REACTIONS","EMBED_LINKS","ATTACH_FILES","USE_EXTERNAL_EMOJIS","USE_APPLICATION_COMMANDS","SEND_TTS_MESSAGES"]
      }
    ]
  })
  await tc.send({
    embeds: [{
      color: color(),
      title: msg.client.user.username + ' INTERFACE',
      description: `❔ This **interface** can be used to manage temporary voice channels. More options are available down below (**LIMITED**).`,
      image: {
        url: "attachment://vc_info.jpg",
      },
      footer: {
        text: `Powered by: XLAND#6190`,
        icon_url: msg.client.user.displayAvatarURL({dynamic:true})
      }
    }],
    files: [{
      attachment: "./src/assets/image/vc_info.jpg",
      name: "vc_info.jpg"
    }],
    components: row
  })
  await db.child(msg.guild.id).child("voice").update({
    vc_category: cat.id,
    vc_creator: vc.id,
    vc_interface: tc.id
  })
  await msg.channel.send(embeds(`✅ Voice Channel berhasil di buat.`))
}
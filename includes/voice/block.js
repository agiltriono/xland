const { MessageActionRow, MessageSelectMenu } = require("discord.js");
const { database, embeds, ephemeral, color } = require(".././../util/util")
const db = database.ref("guild")
module.exports.execute = async function(interaction, client) {
  // voice > temp > userId
  const guild = interaction.guild
  const member = guild.members.cache.get(interaction.user.id);
  const voiceChannel = member.voice.channel;
  if (interaction.customId.includes("vc_selectmenu_")) {
    const args = interaction.customId.replace("vc_selectmenu_",'').split('_')
    const selected = (def, dyn) => {
      return dyn == def ? `Daftar Member ${dyn} Dipilih` : `Daftar Member ${dyn}`
    }
    const value = interaction.values
    var oldcomp = interaction.message.components
    const staff = guild.members.cache.get(value[0]);
    if (staff.permissions.has("ADMINISTRATOR") || staff.permissions.has("MANAGE_GUILD") || staff.user.id === interaction.guild.ownerId) return interaction.update(Object.assign({}, ephemeral(`✅ Selesai!`), {components:[]}))
    var comp = [
      new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId("vc_selectmenu_block_1").setPlaceholder(selected(1,args[1])).addOptions([{label:"none1",value:"none1"}]).setDisabled(true)),
      new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId("vc_selectmenu_block_2").setPlaceholder(selected(2,args[1])).addOptions([{label:"none2",value:"none2"}]).setDisabled(true)),
      new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId("vc_selectmenu_block_3").setPlaceholder(selected(3,args[1])).addOptions([{label:"none3",value:"none3"}]).setDisabled(true)),
      new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId("vc_selectmenu_block_4").setPlaceholder(selected(4,args[1])).addOptions([{label:"none4",value:"none4"}]).setDisabled(true)),
      new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId("vc_selectmenu_block_5").setPlaceholder(selected(5,args[1])).addOptions([{label:"none5",value:"none5"}]).setDisabled(true))
    ]
    var menu = comp.splice(0, oldcomp.length)
    db.child(guild.id).once("value", async (server) => {
      let vc = server.child("voice").child("temp").child(voiceChannel.id)
      let blocked = vc.child("block")
      let array = blocked.exists() ? blocked.val().trim().split(",") : []
      let result = [].concat(array, value)
      let channel = guild.channels.resolve(voiceChannel.id)
      await channel.permissionOverwrites.create(value[0],{
        "VIEW_CHANNEL": true,
        "CONNECT": false,
        "SEND_MESSAGES": false,
        "READ_MESSAGE_HISTORY": false,
        "ADD_REACTIONS": false,
        "EMBED_LINKS": false,
        "ATTACH_FILES": false,
        "USE_EXTERNAL_EMOJIS": false,
        "USE_APPLICATION_COMMANDS": false,
        "SEND_TTS_MESSAGES": false
      })
     await guild.members.cache.get(value[0]).voice.disconnect()
     await db.child(guild.id).child("voice").child("temp").child(voiceChannel.id).update({block:result.toString()})
     await interaction.update(Object.assign(ephemeral(`❌ Blocked Member Channel ${voiceChannel.name}\n\n${result.map(u=>`<@${u}>`).join("\n")}`), {components: menu }))
    })
  } else {
    await interaction.deferReply({ephemeral:true})
    if (!voiceChannel) return interaction.editReply(ephemeral("⚠️ **Please join voice terlebih dahulu.**"));
    db.child(guild.id).once("value", async (server) => {
      var vc = server.child("voice")
      var temp = vc.child("temp").child(voiceChannel.id)
      var trusted = temp.child("trust")
      var blocked = temp.child("block")
      if(temp.numChildren() === 0) return interaction.editReply(ephemeral(`⛔ Kamu gak join di creator voice **${client.user.username}**!`));
      var owner = temp.child("owner").val()
      if (owner != interaction.user.id) return interaction.editReply(ephemeral("⚠️ Akses ditolak! Kamu bukan owner!"));
      var ghost = temp.child("ghost").val()
      if (ghost == "yes") return interaction.editReply(ephemeral(`⚠️ Tidak dapat menggunakan **BLOCK** ketika channel dalam keadaan tersembunyi, Gunakan **UNHIDE** terlebih dahulu.`));
      var isTrusted = trusted.exists() ? trusted.val().trim().split(",") : []
      var isBlocked = blocked.exists() ? blocked.val().trim().split(",") : []
      var isEmpty = voiceChannel.members.filter(member=> member.user.id != interaction.user.id)
      if (isEmpty.size === 0) return interaction.editReply(ephemeral(`⚠️ Member tidak tersedia saat ini.`));
      var user = voiceChannel.members.filter(member=> !isTrusted.includes(member.user.id) && !isBlocked.includes(member.user.id) && member.user.id != interaction.user.id)
      if (user.size === 0) return interaction.editReply(ephemeral(`⚠️ Member tidak tersedia lagi coba gunakan *untrust* atau *unblock*.`));
      const option = user.map(member=> {
        return {
          label: member.user.username,
          value: member.user.id.toString()
        }
      })
      
      if (option.length > 25) {
        const menu = await chunk(option, 25);
        const custom = {
          embeds: [{
            color: color(),
            description: `⚠️ Member terpilih tidak akan dapat bergabung ke **${voiceChannel.name}**`
          }],
          components: menu,
          ephemeral: true
        }
        await interaction.editReply(custom)
      } else {
        const menu = new MessageActionRow().addComponents(new MessageSelectMenu()
          .setCustomId("vc_selectmenu_block_1")
          .setPlaceholder(`Daftar Member 1`)
          .addOptions(option));
        const custom = {
          embeds: [{
            color: color(),
            description: `⚠️ Member terpilih tidak akan dapat bergabung ke **${voiceChannel.name}**`
          }],
          components: [menu],
          ephemeral: true
        }
        await interaction.editReply(custom)
      }
    })
  }
}
async function chunk(obj, i) {
  let chunks = [];
  let count = 0
  while(obj.length){
    count++;
    chunks.push(new MessageActionRow().addComponents(new MessageSelectMenu()
    .setCustomId(`vc_selectmenu_block_${count}`)
    .setPlaceholder(`Daftar Member ${count}`)
    .addOptions(obj.splice(0,i))));
  }
  return chunks;
}
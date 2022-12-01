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
      return dyn == def ? `Target Member ${dyn} Dipilih` : `Target Member ${dyn}`
    }
    const value = interaction.values
    var oldcomp = interaction.message.components
    const staff = guild.members.cache.get(value[0]);
    if (staff.permissions.has("ADMINISTRATOR") || staff.permissions.has("MANAGE_GUILD") || staff.user.id === interaction.guild.ownerId) return interaction.update(Object.assign({}, ephemeral(`✅ Selesai!`), {components:[]}))
    db.child(guild.id).once("value", async (server) => {
      const vc = server.child("voice").child("temp").child(voiceChannel.id)
      const trusted = vc.child("trust")
      const blocked = vc.child("block")
      var isTrusted = trusted.exists() ? trusted.val().trim().split(",") : []
      var comp = [
        new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId("vc_selectmenu_kick_1").setPlaceholder(selected(1,args[1])).addOptions([{label:"none1",value:"none1"}]).setDisabled(true)),
        new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId("vc_selectmenu_kick_2").setPlaceholder(selected(2,args[1])).addOptions([{label:"none2",value:"none2"}]).setDisabled(true)),
        new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId("vc_selectmenu_kick_3").setPlaceholder(selected(3,args[1])).addOptions([{label:"none3",value:"none3"}]).setDisabled(true)),
        new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId("vc_selectmenu_kick_4").setPlaceholder(selected(4,args[1])).addOptions([{label:"none4",value:"none4"}]).setDisabled(true)),
        new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId("vc_selectmenu_kick_5").setPlaceholder(selected(5,args[1])).addOptions([{label:"none5",value:"none5"}]).setDisabled(true))
      ]
      var menu = comp.splice(0, oldcomp.length)
      let channel = guild.channels.resolve(voiceChannel.id)
      await guild.members.cache.get(value[0]).voice.disconnect()
      const permit = channel.permissionOverwrites.cache.get(value[0])
      if (permit) {
        await permit.delete();
      }
      if (isTrusted.inculdes(value[0])) {
        let result = array.filter(u=>u != value)
        if (result.length == 0) await db.child(guild.id).child("voice").child("temp").child(voiceChannel.id).child("trust").remove();
        if (result.length > 0) await db.child(guild.id).child("voice").child("temp").child(voiceChannel.id).update({trust:result.toString()});
      }
      await interaction.update(Object.assign(ephemeral(`⚠️ <@${value}> Telah di kick dari channel **${voiceChannel.name}**`), {components: menu }))
    })
  } else {
    await interaction.deferReply({ephemeral:true})
    if (!voiceChannel) return interaction.editReply(ephemeral("⚠️ **Please join voice terlebih dahulu.**"));
    db.child(guild.id).once("value", async (server) => {
      var vc = server.child("voice")
      var temp = vc.child("temp").child(voiceChannel.id)
      if(temp.numChildren() === 0) return interaction.editReply(ephemeral(`⛔ Kamu gak join di creator voice **${client.user.username}**!`));
      var owner = temp.child("owner").val()
      if (owner != interaction.user.id) return interaction.editReply(ephemeral("⚠️ Akses ditolak! Kamu bukan owner!"));
      var ghost = temp.child("ghost").val()
      if (ghost == "yes") return interaction.editReply(ephemeral(`⚠️ Tidak dapat menggunakan **KICK** ketika channel dalam keadaan tersembunyi, Gunakan **UNHIDE** terlebih dahulu.`));
      var user = voiceChannel.members.filter(member=> member.user.id != interaction.user.id)
      if (user.size === 0) return interaction.editReply(ephemeral(`⚠️ Member tidak tersedia saat ini.`));
      var option = user.map(member=> {
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
            description: `⚠️ Member terpilih akan di kick langsung dari **${voiceChannel.name}**`
          }],
          components: menu,
          ephemeral: true
        }
        await interaction.editReply(custom)
      } else {
        const menu = new MessageActionRow().addComponents(new MessageSelectMenu()
          .setCustomId("vc_selectmenu_kick_1")
          .setPlaceholder(`Target Member 1`)
          .addOptions(option));
        const custom = {
          embeds: [{
            color: color(),
            description: `⚠️ Member terpilih akan di kick langsung dari channel **${voiceChannel.name}**`
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
    .setCustomId(`vc_selectmenu_kick_${count}`)
    .setPlaceholder(`Target Member ${count}`)
    .addOptions(obj.splice(0,i))));
  }
  return chunks;
}
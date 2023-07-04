const { database, embeds, ephemeral } = require(".././../util/util")
const db = database.ref("guild")
module.exports.execute = async function(interaction, client) {
  // voice > temp > userId
  const guild = interaction.guild
  const member = guild.members.cache.get(interaction.user.id);
  const voiceChannel = member.voice.channel;
  await interaction.deferReply({ephemeral: true})
  if (!voiceChannel) return interaction.editReply(ephemeral("⚠️ **Please join voice terlebih dahulu.**"));
  db.child(guild.id).once("value", async (server) => {
    var vc = server.child("voice")
    var temp = vc.child("temp").child(voiceChannel.id)
    if(temp.numChildren() === 0) return interaction.editReply(ephemeral(`⛔ Kamu gak join di creator voice **${client.user.username}**!`));
    var owner = temp.child("owner").val()
    if (owner == interaction.user.id) return interaction.editReply(ephemeral("⚠️ Kamu sudah memiliki hak akses **Owner**!"));
    let channel = interaction.guild.channels.resolve(voiceChannel.id)
    let isEmpty = channel.members.filter(member=> member.user.id === owner).size
    if (isEmpty != 0) return interaction.editReply(ephemeral("⚠️ Akses ditolak! Maaf tapi **Owner** masih ada di voice!"))
    await db.child(interaction.guild.id).child("voice").child("temp").child(voiceChannel.id).update({
      owner:interaction.user.id
    })
    await channel.permissionOverwrites.edit(interaction.user.id, {
      "VIEW_CHANNEL": true,
      /*"MANAGE_CHANNELS": true,
      "MANAGE_ROLES": true,*/
      "CONNECT": true
    })
    await channel.permissionOverwrites.cache.get(owner).delete()
    await interaction.editReply(ephemeral(`🔑 Hak akses di berikan! sekarang kamu adalah **Owner**`));
  })
}
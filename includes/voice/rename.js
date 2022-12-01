const { MessageActionRow, MessageButton, Modal, TextInputComponent } = require("discord.js");
const { database, embeds, ephemeral } = require(".././../util/util")
const db = database.ref("guild")
module.exports.execute = async function(interaction, client) {
  // voice > temp > userId
  const guild = interaction.guild
  const member = guild.members.cache.get(interaction.user.id);
  const voiceChannel = member.voice.channel;
  if (interaction.customId.includes("vc_modal_")) {
    const field = interaction.fields
    const value = field.getTextInputValue('vc_modal_rename_input');
    const channel = await interaction.guild.channels.resolve(voiceChannel.id)
    await channel.setName(value)
    return interaction.reply(ephemeral(`✅ Nama berhasil diganti ke **${value}**`));
  } else {
    if (!voiceChannel) return interaction.reply(ephemeral("⚠️ **Please join voice terlebih dahulu.**"));
    db.child(guild.id).once("value", async (server) => {
      var vc = server.child("voice")
      var temp = vc.child("temp").child(voiceChannel.id)
      if(temp.numChildren() === 0) return interaction.reply(ephemeral(`⛔ Kamu gak join di creator voice **${client.user.username}**!`));
      var owner = temp.child("owner").val()
      if (owner != interaction.user.id) return interaction.reply(ephemeral("⚠️ Akses ditolak! Kamu bukan owner!"));
      const modal = new Modal()
          .setCustomId('vc_modal_rename')
          .setTitle('Edit Nama Channel')
          .addComponents([
            new MessageActionRow().addComponents(
              new TextInputComponent()
                .setCustomId('vc_modal_rename_input')
                .setLabel('Nama Channel')
                .setStyle('SHORT')
                .setMinLength(2)
                .setMaxLength(30)
                .setPlaceholder('Masukan Nama Baru..')
                .setRequired(true)
            )
          ]);
        await interaction.showModal(modal);
    })
  }
}
const { MessageActionRow, Modal, TextInputComponent } = require("discord.js");
const { database, embeds, ephemeral } = require(".././../util/util")
const db = database.ref("guild")
module.exports.execute = async function(interaction, client) {
  // voice > temp > userId
  const guild = interaction.guild
  const member = guild.members.cache.get(interaction.user.id);
  const voiceChannel = member.voice.channel;
  if (interaction.customId.includes("vc_modal_")) {
    const field = interaction.fields
    const value = field.getTextInputValue('vc_modal_limit_input');
    if(parseInt(value) < 0) return interaction.reply(ephemeral("⚠️ Limit di bawah batas minimum!"));
    if(parseInt(value) > 99) return interaction.reply(ephemeral("⚠️ Limit melebihi batas maksimal!"));
    const channel = await interaction.guild.channels.resolve(voiceChannel.id)
    await channel.setUserLimit(parseInt(value))
    return interaction.reply(ephemeral(`✅  Channel limit **${value}** member.`));
  } else {
    if (!voiceChannel) return interaction.reply(ephemeral("⚠️ **Please join voice terlebih dahulu.**"));
    db.child(guild.id).once("value", async (server) => {
      var vc = server.child("voice")
      var temp = vc.child("temp").child(voiceChannel.id)
      if(temp.numChildren() === 0) return interaction.reply(ephemeral(`⛔ Kamu gak join di creator voice **${client.user.username}**!`));
      var owner = temp.child("owner").val()
      if (owner != interaction.user.id) return interaction.reply(ephemeral("⚠️ Akses ditolak! Kamu bukan owner!"));
      const modal = new Modal()
          .setCustomId('vc_modal_limit')
          .setTitle('Edit Limit Channel')
          .addComponents([
            new MessageActionRow().addComponents(
              new TextInputComponent()
                .setCustomId('vc_modal_limit_input')
                .setLabel('Akses Limit 0 - 99')
                .setStyle('SHORT')
                .setMinLength(1)
                .setMaxLength(2)
                .setPlaceholder('Masukan Jumlah..')
                .setRequired(true)
            )
          ]);
        await interaction.showModal(modal);
    })
  }
}
const { database } = require(".././../util/util");
const db = database.ref("guild");
module.exports.execute = async function (interaction, client) {
  if (!interaction.member.permissionsIn(interaction.channel)) return interaction.reply({content: "Permissions denied !", ephemeral: true});
  db.child(interaction.guild.id).once("value", async (data) => {
    const moderator = data.child("admin").val();
    const guild = client.guilds.cache.get(interaction.guildId);
    const chan = guild.channels.cache.get(interaction.channelId);
    await interaction.deferReply({
      ephemeral: true
    })
    const row = new client.discord.MessageActionRow()
      .addComponents(
        new client.discord.MessageButton()
        .setCustomId(`confirm_close_${interaction.user.id}`)
        .setLabel('Close ticket')
        .setStyle('DANGER'),
        new client.discord.MessageButton()
        .setCustomId(`cancel_close_${interaction.user.id}`)
        .setLabel('Cancel closing')
        .setStyle('SECONDARY'),
      );

    const verif = await interaction.editReply({
      content: 'Are you sure do you wanna close the ticket ?',
      components: [row]
    });
    const filter = async (i) => {
      await i.deferUpdate()
      return i.customId && i.user.id === interaction.user.id;
    }
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      componentType: 'BUTTON',
      time: 20000
    });

    collector.on('collect', async(i) => {
      if (i.customId == `confirm_close_${i.user.id}`) {
        interaction.editReply({
          content: `Ticket closed by <@!${interaction.user.id}>`,
          components: []
        });

        chan.edit({
            name: `closed-${chan.name}`,
            permissionOverwrites: [
              {
                id: client.users.cache.get(chan.topic),
                deny: ['SEND_MESSAGES', 'VIEW_CHANNEL']
              },
              {
                id: moderator,
                allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
              },
              {
                id: interaction.guild.roles.everyone,
                deny: ['VIEW_CHANNEL','SEND_MESSAGES']
              },
            ],
          })
          .then(async () => {
            const embed = new client.discord.MessageEmbed()
              .setColor('6d6ee8')
              .setAuthor('Ticket', client.user.avatarURL())
              .setDescription('```Control ticket```')
              .setFooter(client.user.username, interaction.guild.iconURL())
              .setTimestamp();

            const row = new client.discord.MessageActionRow()
              .addComponents(
                new client.discord.MessageButton()
                .setCustomId(`delete_ticket_${i.user.id}`)
                .setLabel('Remove ticket')
                .setEmoji('🗑️')
                .setStyle('DANGER'),
              );

            await interaction.reply({
              embeds: [embed],
              components: [row],
              ephemeral : true
            });
          });

        collector.stop();
      };
      if (i.customId === `cancel_close_${i.user.id}`) {
        await interaction.editReply({
          content: 'Closing ticket was canceled!',
          components: []
        });
        collector.stop();
      };
    });

    collector.on('end', async(i) => {
      if (i.size < 1) {
        await interaction.editReply({
          content: 'Closing ticket canceled!',
          components: []
        })
      }
    })
  })
}
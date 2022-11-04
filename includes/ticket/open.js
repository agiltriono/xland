const { database } = require(".././../util/util");
const db = database.ref("guild");
module.exports.execute = async function(interaction, client) {
  if (!interaction.member.permissionsIn(interaction.channel)) return interaction.reply({content: "Permissions denied !", ephemeral: true});
  db.child(interaction.guild.id).once("value", async (data) => {
    var cat = []
    const ticket = data.child("ticket")
    const category = ticket.child("category").val();
    const channel = ticket.child("channel").val();
    const moderator = ticket.child("moderator").val();
    const topic = ticket.child("topic").val();
    if (topic.indexOf(",") > -1) {
      const categ = topic.split(",");
      categ.forEach(ch => {
        const str = ch.charAt(0).toUpperCase() + ch.slice(1);
        cat.push({ label: str, value: str })
      })
    } else {
      cat.push({ label: topic, value: topic })
    }
    if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
      return interaction.reply({
        content: 'You have created a ticket !',
        ephemeral: true
      })
    }

    interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
      parent: category,
      topic: interaction.user.id,
      type: 'GUILD_TEXT'
    }).then(async c => {
      await c.lockPermissions()
      await c.permissionOverwrites.create(interaction.user.id,{
        VIEW_CHANNEL:true,
        SEND_MESSAGES:true
      })
      await interaction.reply({
        content: `Your ticket are at <#${c.id}>`,
        ephemeral: true
      });

      const embed = new client.discord.MessageEmbed()
        .setColor('6d6ee8')
        .setAuthor('Ticket', client.user.avatarURL())
        .setDescription('Choose your ticket category')
        .setFooter(interaction.guild.name, interaction.guild.iconURL())
        .setTimestamp();

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageSelectMenu()
          .setCustomId(`select_ticket_topic_for_${c.id}`)
          .setPlaceholder('Select ticket category')
          .addOptions(cat),
        );

      msg = await c.send({
        content: `<@!${interaction.user.id}>`,
        embeds: [embed],
        components: [row]
      });

      const collector = msg.createMessageComponentCollector({
        componentType: 'SELECT_MENU',
        time: 20000
      });

      collector.on('collect', i => {
        if (i.user.id === interaction.user.id) {
          if (msg.deletable) {
            msg.delete().then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('6d6ee8')
                .setAuthor('Ticket', interaction.user.displayAvatarURL({format:'png'}))
                .setDescription(`<@!${interaction.user.id}> Created a ticket ${i.values[0].charAt(0).toUpperCase() + i.values[0].slice(1)}`)
                .setFooter(interaction.user.username, interaction.user.displayAvatarURL({format:'png'}))
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId(`close_ticket_${i.user.id}`)
                  .setLabel('Close ticket')
                  .setEmoji('❌')
                  .setStyle('DANGER'),
                );

              const opened = await c.send({
                content: `<@&${moderator}>`,
                embeds: [embed],
                components: [row]
              });

              opened.pin().then(() => {
                opened.channel.bulkDelete(1);
              });
            });
          };
          if (i.values[0]) {
            c.edit({
              name : `${c.name}_${i.values[0]}`,
              parent: category
            });
          };
        };
      });

      collector.on('end', collected => {
        if (collected.size < 1) {
          c.send(`No category selected. Closing Ticket...`).then(() => {
            setTimeout(() => {
              if (c.deletable) {
                c.delete();
              };
            }, 5000);
          });
        };
      });
    });
  })
}
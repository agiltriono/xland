const { database } = require("../util/util");
const db = database.ref("guild");

module.exports = {
  async isButton(interaction, client) {
	  if ((/^buat_channel_[a-zA-Z0-9]{11}/).test(interaction.customId)) {
		await interaction.deferReply({ephemeral:true})
		interaction.guild.channels.create(`👑-room-${interaction.user.username}`, {
      parent: interaction.channel.parent,
      topic: interaction.user.id,
      type: 'text'
    }).then(async clone => {
      await clone.lockPermissions()
      await clone.permissionOverwrites.set(interaction.channel.permissionOverwrites.cache)
  		db.child(interaction.guild.id).once("value", async(server) => {
  			var prefix = server.child("prefix").val() ? server.child("prefix").val() : interaction.client.prefix;
  			var text_room = server.child("text_room");
  			if(text_room.numChildren() === 0) {
  				await interaction.editReply({ content: `:white_check_mark: Channel sudah berhasil di buat\nKunjungi channel <#${clone.id}>`, ephemeral: true })
  				await clone.send(`>>> **ROOM MASTER** <@${interaction.user.id}> :crown:`);
  			} else {
  				var allowrole = text_room.child("allowrole").val();
  				var rolelist = allowrole.trim().replace(/ +/, "")
  				var array = rolelist.split(",")
  				var count = []
  				if (rolelist != "") {
  					if (rolelist.split(",").length >= 1) {
  						for(let i = 0; i < array.length; i++) {
  							count.push(i)
  							if (array[i]) {
  							  const role = interaction.guild.roles.cache.find(r => r.id === array[i])
  							  await clone.permissionOverwrites.create(role, { 
  								VIEW_CHANNEL: true,
  								SEND_MESSAGES: true,
  								READ_MESSAGE_HISTORY: true
  							  });
  							}
  							if (count.length === array.length) {
  								await interaction.editReply({ content: `:white_check_mark: Channel sudah berhasil di buat\nKunjungi channel <#${clone.id}>`, ephemeral: true })
  								await clone.send(`>>> **ROOM MASTER** <@${interaction.user.id}> :crown:`);
  								break;
  							}
  						}
  					} else {
  						const role = interaction.guild.roles.cache.find(r => r.id === rolelist)
  						await clone.permissionOverwrites.create(role, { 
  							VIEW_CHANNEL: true,
  							SEND_MESSAGES: true,
  							READ_MESSAGE_HISTORY: true
  						});
  						await interaction.editReply({ content: `:white_check_mark: Channel sudah berhasil di buat\nKunjungi channel <#${clone.id}>`, ephemeral: true })
  						await clone.send(`>>> **ROOM MASTER** <@${interaction.user.id}> :crown:`);
  					}
  				}
  			}
  		})
	  })
	}
    if ((/^upvote_[a-zA-Z0-9]{11}_[0-9]/).test(interaction.customId)) {
      await interaction.deferReply({ephemeral:true})
      const id = interaction.customId.split("_")[1];
      const msgid = interaction.message.id;
      const count = interaction.customId.split("_")[2];
      const channel = client.channels.cache.get(interaction.channelId);
      if (!client.votesdown.has(id)) {
        client.votesdown.set(id, new client.discord.Collection());
      }
    
      const now = Date.now();
      const timestamps = client.votesdown.get(id);
      const cooldownAmount = 120000;
      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          const elapsed = client.timeconvert(timeLeft);
          return await interaction.editReply({content: `you have recently been voted! wait until ${elapsed.h ? `${elapsed.h} hour` : elapsed.m ? `${elapsed.m} minute` : elapsed.s ? `${elapsed.s} second` : "0 second"}`});
        }
      }
    
      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
      const m = await channel.messages.fetch(msgid);
      const components = m.components[0];
      const embed = m.embeds[0];
      components.components[0].customId = `upvote_${id}_${parseInt(count) +1}`;
      embed.fields[0].value = `${client.numformat(parseInt(components.components[0].customId.split("_")[2]))} ${embed.fields[0].value.split(' ')[1]}`;
      m.edit({embeds : [embed], components : [components]});
      await interaction.editReply({ content: 'Thank you !' })
    }
    if ((/^downvote_[a-zA-Z0-9]{11}_[0-9]/).test(interaction.customId)) {
      await interaction.deferReply({ephemeral:true})
      const id = interaction.customId.split("_")[1];
      const msgid = interaction.message.id;
      const count = interaction.customId.split("_")[2];
      const channel = client.channels.cache.get(interaction.channelId);
      if (!client.votesdown.has(id)) {
        client.votesdown.set(id, new client.discord.Collection());
      }
    
      const now = Date.now();
      const timestamps = client.votesdown.get(id);
      const cooldownAmount = 120000;
      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          const elapsed = client.timeconvert(timeLeft);
          return await interaction.editReply({content: `you have recently been voted! wait until ${elapsed.h ? `${elapsed.h} hour` : elapsed.m ? `${elapsed.m} minute` : elapsed.s ? `${elapsed.s} second` : "0 second"}`});
        }
      }
    
      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
      const m = await channel.messages.fetch(msgid);
      const components = m.components[0];
      const embed = m.embeds[0];
      components.components[1].customId = `downvote_${id}_${parseInt(count) +1}`;
      embed.fields[1].value = `${client.numformat(parseInt(components.components[1].customId.split("_")[2]))} ${embed.fields[1].value.split(' ')[1]}`;
      m.edit({embeds : [embed], components : [components]});
      await interaction.editReply({ content: 'Thank you !' })
    }
    if ((/^open_ticket_[a-zA-Z0-9]{11}/).test(interaction.customId)) {
      if (!interaction.member.permissionsIn(interaction.channel)) return interaction.reply({content: "Permissions denied !", ephemeral: true});
      return client.db.child(interaction.guild.id).once("value", async (data) => {
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
          type: 'text'
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
      });
    };
    if (interaction.customId === `close_ticket_${interaction.user.id}`) {
      if (!interaction.member.permissionsIn(interaction.channel)) return interaction.reply({content: "Permissions denied !", ephemeral: true});
      return client.db.child(interaction.guild.id).once("value", async (data) => {
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
            });
          };
        });
      });
    };
    if (interaction.customId === `delete_ticket_${interaction.user.id}`) {
      if (!interaction.member.permissions.has("VIEW_CHANNEL") && !interaction.member.permissions.has("SEND_MESSAGES")) return interaction.reply({content: "Permissions denied !", ephemeral: true});
      return client.db.child(interaction.guild.id).once("value", async (data) => {
        const log = data.child("log").child("channel").val();
        const guild = client.guilds.cache.get(interaction.guildId);
        const chan = guild.channels.cache.get(interaction.channelId);
        
        await interaction.deferReply({
          ephemeral : true
        });
  
        chan.messages.fetch().then(async (messages) => {
          let a = messages.filter(m => !m.author.bot).map(m =>
            `${new Date(m.createdTimestamp).toLocaleString('en-US')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
          ).reverse().join('\n');
          if (a.length < 1) a = "No data";
            const file = new require("buffer").Buffer.from(a, 'utf8');
            const attach = new client.discord.MessageAttachment(file, `${interaction.channel.name}.txt`);
            const embed = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', client.user.avatarURL())
              .setDescription(`📰 Log ticket \`${chan.id}\` created by <@!${chan.topic}> and removed by <@!${interaction.user.id}>\n\nLogs: ***See Attachment***`)
              .setColor('2f3136')
              .setTimestamp();
            const embed2 = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', client.user.avatarURL())
              .setDescription(`📰 voting ticket log \`${chan.id}\`\n\nLogs: ***See Attachment***`)
              .setColor('2f3136')
              .setTimestamp();
            client.channels.cache.get(log).send({
              embeds: [embed], 
              files: [attach]
            })
            client.users.cache.get(chan.topic).send({
              embeds: [embed2],
              files: [attach]
            })
            await interaction.editReply('Logs ticket have been created');
            setTimeout(() => chan.delete(), 5000);
        })
      })
    }
  }
}
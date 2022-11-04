const { database } = require(".././../util/util");
const db = database.ref("guild");
module.exports = {
  async textchannel(interaction, client) {
    await interaction.deferReply({ephemeral:true})
		interaction.guild.channels.create(`👑-room-${interaction.user.username}`, {
      parent: interaction.channel.parent,
      topic: interaction.user.id,
      type: 'GUILD_TEXT'
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
}
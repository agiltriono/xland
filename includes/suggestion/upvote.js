module.exports.execute = async function(interaction, client) {
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
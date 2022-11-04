const { database, clear } = require(".././../util/util");
const db = database.ref("guild");
module.exports.execute = async function (interaction, client) {
  if (!interaction.member.permissionsIn(interaction.channel)) return interaction.reply({content: "Permissions denied !", ephemeral: true});
  db.child(interaction.guild.id).once("value", async (data) => {
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
        const logchan = client.channels.cache.get(log)
        if(logchan) {
          await logchan.send({
            embeds: [embed], 
            files: [attach]
          })
        }
        await clear(chan, 3000)
    })
  })
}
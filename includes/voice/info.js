const { database, embeds, ephemeral, color } = require(".././../util/util")
const db = database.ref("guild")
module.exports.execute = async function(interaction, client) {
  // voice > temp > userId
  const guild = interaction.guild
  const member = guild.members.cache.get(interaction.user.id);
  const voiceChannel = member.voice.channel;
  await interaction.deferReply({ephemeral:true})
  if (!voiceChannel) return interaction.editReply(ephemeral("⚠️ **Please join voice terlebih dahulu.**"));
    db.child(guild.id).once("value", async (server) => {
      var vc = server.child("voice")
      var temp = vc.child("temp").child(voiceChannel.id)
      var trusted = temp.child("trust")
      var blocked = temp.child("block")
      var ghost = temp.child("ghost")
      if(temp.numChildren() === 0) return interaction.editReply(ephemeral(`⛔ Kamu gak join di creator voice **${client.user.username}**!`));
      var owner = temp.child("owner").val()
      if (owner != interaction.user.id) return interaction.editReply(ephemeral("⚠️ Akses ditolak! Kamu bukan owner!"));
      /*
      nsfw: false,
      id: '1035951956390318091',
      name: 'XLAND',
      rawPosition: 4,
      rtcRegion: null,
      bitrate: 64000,
      userLimit: 0,
      videoQualityMode: null,
      lastMessageId: null,
      rateLimitPerUser: 0
      */
      let trust = trusted.exists() ? trusted.trim().split(",") : []
      let block = blocked.exists() ? blocked.val().trim().split(",") : []
      let channel = interaction.guild.channels.resolve(voiceChannel.id)
      let user = channel.members.filter(member=>!member.user.bot)
      let bot = channel.members.filter(member=>member.user.bot)
      let bitrate = channel.bitrate
      let limit = channel.userLimit
      let region = channel.rtcRegion != null ? channel.rtcRegion : "Automatic"
      let content = {
       embeds : [{
         color: color(),
         title: `Informasi Channel`,
         fields: [
          {name: "NAMA", value: `${channel.name}`},
          {name: "OWNER", value: `<@${owner}>`},
          {name: "MEMBER", value: `${user.size.toString()}`},
          {name: "BOT", value: `${bot.size.toString()}`},
          {name: "TRUSTED", value: `${trust.length}`},
          {name: "BLOCKED", value: `${block.length}`},
          {name: "REGION", value: `${region}`},
          {name: "LIMIT", value: `${limit}`},
          {name: "BITRATE", value: `${bitrate.toString().slice(0, -3)}bps`},
          {name: "VISIBILITY", value: `${ghost.val().toUpperCase() == "YES" ? "NO" : "YES"}`}
         ],
         footer: {
           text: "discord.gg/imutserver",
           icon_url: client.user.displayAvatarURL({dynamic:true})
         }
       }],
       ephemeral:true
     }
    await interaction.editReply(content);
  })
}
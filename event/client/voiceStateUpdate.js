const { database } = require(".././../util/util")
const db = database.ref("guild")
module.exports = {
  name: "voiceStateUpdate",
  async execute(oldState, newState, client) {
    var oldChannel = oldState.channel
    var oldChannelId = oldState.channelId
    var member = newState.member
    var guild = newState.guild
    var newChannel = newState.channel
    var newChannelId = newState.channelId
/////////...... AUTO CHANNEL ....../////////
    db.child(guild.id).once("value", async (server) => {
      const vc = server.child("voice")
      const mainChannel = vc.child("vc_creator").val()
      const temp = vc.child("temp")
      // NEW User Want Join Creator Channel
      if (newState.channelId && newChannelId === mainChannel) {
        // Create Channel
        const main = guild.channels.cache.get(mainChannel)
        const channel = await guild.channels.create(
            `${member.user.username}`,
            {
              type: 'GUILD_VOICE', 
              parent: main.parent
            }
        );
        await channel.permissionOverwrites.set(main.permissionOverwrites.cache)
        await channel.permissionOverwrites.create(member.user.id, {
          "VIEW_CHANNEL": true,
          /*"MANAGE_CHANNELS": true,
          "MANAGE_ROLES": true,*/
          "CONNECT": true,
          "SEND_MESSAGES": true,
          "READ_MESSAGE_HISTORY": true,
          "ADD_REACTIONS": true,
          "EMBED_LINKS": true,
          "ATTACH_FILES": true,
          "USE_EXTERNAL_EMOJIS": true,
          "USE_APPLICATION_COMMANDS": true,
          "SEND_TTS_MESSAGES": true
        })
        // Add the channel id to the array of temporary channel ids.
        await db.child(guild.id).child("voice").child('temp').child(channel.id).update({
          owner: member.user.id,
          ghost: "no"
        })
        // Move the member to the new channel.
        await newState.setChannel(channel);
        return;
      }
      // User leave temporary channel
      if (oldState.channelId && oldChannelId != newChannelId && temp.child(oldChannelId).exists()) {
        const memberCount = oldState.channel.members.filter(member=> !member.user.bot).size
        if (memberCount === 0) {
          // Delete the channel
          await oldChannel.delete();
          //await db.child(guild.id).child("voice").child("temp").child(oldChannelId).remove()
          return;
        } else {
          // delete permission
          const channel = await guild.channels.resolve(oldChannelId)
          const owner = temp.child(oldChannelId).child("owner").val()
          const trusted = temp.child(oldChannelId).child("trust")
          const blocked = temp.child(oldChannelId).child("block")
          const isTrusted = trusted.exists() ? trusted.val().trim().split(",") : []
          const isBlocked = blocked.exists() ? blocked.val().trim().split(",") : []
          const permit = channel.permissionOverwrites.cache.get(member.user.id);
          if(member.user.id === owner) return;
          if(isBlocked.length != 0 && isBlocked.includes(member.user.id)) return;
          if (isTrusted.length != 0 && isTrusted.includes(member.user.id)) return;
          if (permit) await permit.delete();
        }
      }
      // NEW User Join Temporary Voice Channel
      if(!oldState.channelID && temp.child(newChannelId).exists()) {
        const channel = await guild.channels.resolve(newChannelId)
        const owner = temp.child(newChannelId).child("owner").val()
        const trusted = temp.child(newChannelId).child("trust")
        const blocked = temp.child(newChannelId).child("block")
        const isTrusted = trusted.exists() ? trusted.val().trim().split(",") : []
        const isBlocked = blocked.exists() ? blocked.val().trim().split(",") : []
        if(isBlocked.length != 0 && isBlocked.includes(member.user.id)) return;
        if (isTrusted.length != 0 && isTrusted.includes(member.user.id)) return;
        if (member.user.id != owner) await channel.permissionOverwrites.create(member.user.id, {
          "SEND_MESSAGES": true,
          "READ_MESSAGE_HISTORY": true,
          "ADD_REACTIONS": true,
          "EMBED_LINKS": true,
          "ATTACH_FILES": true,
          "USE_EXTERNAL_EMOJIS": true,
          "USE_APPLICATION_COMMANDS": true,
          "SEND_TTS_MESSAGES": true
        })
      }
    })
  }
}
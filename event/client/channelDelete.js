const fs = require("fs");
const path = require("path");
const { database } = require(".././../util/util")
const db = database.ref("guild")
module.exports = {
  name : "channelDelete",
  async execute(channel, client) {
    if (channel.type != "GUILD_VOICE") return;
    const channelId = channel.id
    const guild = channel.guild
    db.child(guild.id).once("value", async (temp) => {
      const vc = temp.child("voice").child("temp").child(channelId)
      if(vc.exists()) await db.child(guild.id).child("voice").child("temp").child(channelId).remove();
      return;
    })
  }
}
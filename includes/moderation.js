module.exports = {
  async Restrict(msg, strict) {
    const ch = strict.child(msg.channelId)
    const type = ch.child("type").val()
    const start = ch.child("start").val()
    const min = ch.child("min").val()
    const string = msg.content
    if(type === "start") {
      if (!string.startsWith(start)) {
        await msg.delete()
        return true;
      } else {
        return false;
      }
    } else if (type === "min") {
      if(string.length < parseInt(min)) {
        await msg.delete();
        return true;
      } else {
        return false;
      }
    } else if (type === "attach_only") {
      if (!msg.attachments.first()) {
        await msg.delete();
        return true;
      } else {
        return false;
      }
    } else if (type === "qr_only") {
      await msg.delete()
      if (string.startsWith("quotes ") && string.startsWith("riddle ")) {
        const webhook = await msg.channel.createWebhook(msg.author.username, {avatar: msg.author.displayAvatarURL({format:"jpg"})})
        const content = {
          embeds: [
            {
                "color": parseInt(color().substr(1), 16),
                "description": string.startsWith("quotes ") ? string.replace("quotes ", "") : string.replace("riddle ","")
            }
          ]
        }
        await webhook.send(content)
        await webhook.delete();
        return true;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
}
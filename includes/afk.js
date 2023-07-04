const { database, clear } = require("../util/util")
const db = database.ref("guild")
module.exports = {
  async isAfk(msg, afk) {
    const guild = msg.guild
    const mention = msg.mentions.members.array() || []
    if(afk.child("member").child(msg.author.id).exists()) {
      await db.child(guild.id).child("afk").child("member").child(msg.author.id).remove();
      const m = await msg.reply(`I just remove your AFK!`)
      await clear(m,3000)
    } else if (mention.length != 0) {
      let found = []
      let progres = 0
      for(let i = 0; i < mention.length;i++) {
        progres++;
        if (afk.child("member").child(mention.at(i).user.id).exists()) {
          found.push(mention.at(i).user.id)
        }
        if(progres === mention.length) {
          if (found.length != 0) {
            const user = afk.child("member")
            const reason = found.map(u=>{
              return user.child(u).child("reason").val() != "" ? `<@${u}> ${user.child(u).child("reason").val()}` : `<@${u}> GAK ADA!!!`
            }).join("\n")
            await msg.reply(reason);
          }
          break;
        }
      }
    }
  }
}
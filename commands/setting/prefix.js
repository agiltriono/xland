const { database, PREFIX, clear, embeds, remove } = require(".././../util/util");
const { get } = require(".././../util/get");
const i18n = require(".././../util/i18n");
const colorful = require(".././../util/color");
const db = database.ref("guild");
module.exports.help = {
    name: "prefix",
    aliases: ["px"],
    usage:"",
    category: "Setting",
    permissions: ["ADMINISTRATOR"],
    description: "prefix.description"
}

module.exports.run = async (msg, args, creator, client, old) => {
  if (!msg.member.permissions.has("ADMINISTRATOR")) return msg.reply(i18n.__("common.command.permissions.denied"));
  var prefixes = [];
  var messages = [];
  db.child(msg.guild.id).once("value",async(data) => {
    const current = data.child("prefix").val();
    const defaults = old != PREFIX ? old : PREFIX;
    
    msg.channel.send(embeds(i18n.__mf("prefix.info", { curfix : (current ? current : defaults) || defaults }))).then (msg => {
      messages.push(msg.id)
    })
    
    const filter = m => m.content && m.author.id == creator.id;
    
    const collector = msg.channel.createMessageCollector({filter, time : 30000});
    
    collector.on("collect", m => {
      const content = m.content;
      if (content != defaults && content.toLowerCase() != "exit") {
        db.child(msg.guild.id).update({
         "prefix": content
        });
        
        prefixes.push(content)
        collector.stop("submited")
      } else if (content.toLowerCase() == "exit") {
        collector.stop("exit")
      } else {
        msg.channel.send(i18n.__("prefix.equal")).then(msg => {
          clear(msg, 2000)
        })
      }
    })
    
    collector.on("end", (collected, reason) => {
      if (reason == "time") {
        remove(msg, messages[0])
        msg.channel.send(i18n.__("common.commandTimeout")).then(msg => { 
          clear(msg, 5000)
        })
      }
      if (reason == "submited") {
        remove(msg, messages[0])
        clear(collected.first())
        msg.channel.send(embeds(i18n.__mf("prefix.finish",{prefix:prefixes[0]}))).then(msg => {
            clear(msg, 5000)
        })
      }
      if (reason == "exit") {
        remove(msg, messages[0])
        clear(collected.first())
      }
    })
  })
};

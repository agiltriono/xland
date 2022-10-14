const { database, clear, embeds, remove } = require(".././../util/util");
const i18n = require(".././../util/i18n");
const colorful = require(".././../util/color");
const db = database.ref("guild");
const fs = require("fs");
const path = require("path");

module.exports.help = {
  name: "language",
  aliases: ["lang"],
  usage:"",
  category: "Setting",
  permissions: ["ADMINISTRATOR"],
  description: "language.description"
}
module.exports.run =  async (msg, args, creator) => {
  if (!msg.member.permissions.has("ADMINISTRATOR")) return msg.reply(i18n.__("common.command.permissions.denied"));
  var locale = [];
  var messages = [];
  const listFileNames = (relativeName) => {
    try {
      const folderPath = path.join(process.cwd(), ...relativeName.split("/"));
      return fs
        .readdirSync(folderPath,{ withFileTypes: true })
        .filter((dirent) => dirent.isFile())
        .map((dirent) => dirent.name.split(".")[0]);
    } catch (err) {
      console.error(err)
    }
  };
  const listres = listFileNames("./src/assets/json/locales").toString();
  const listsrc = "\`"+listres.replace(/,/g, ", ")+"\`";
    
  db.child(msg.guild.id).once("value", (snapshoot) => {}).then(async data => {
    const current = data.child("lang").val();
  
    msg.channel.send(embeds(i18n.__mf("language.info", { currentlang: (current ? current : i18n.getLocale()) || i18n.getLocale(), alllang: listsrc }))).then(msg => {
      messages.push(msg.id)
    })
    
    const filter = m => m.content.toLowerCase() && m.author == creator.id;
    const collector = msg.channel.createMessageCollector({filter, time : 30000 });
    
    collector.on("collect", m => {
      const content = m.content.toLowerCase();
    if (listFileNames("./src/assets/json/locales").includes(content) && content != "exit") {

      db.child(msg.guild.id).update({
        "lang": content
      });
      i18n.setLocale(content)
      locale.push(content)
      collector.stop("submited")
    } else if (content == "exit") {
      collector.stop("exit")
    } else {
      msg.channel.send(embeds(i18n.__mf("language.notfound", { message : content }))).then(msg => {
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
       msg.channel.send(embeds(i18n.__mf("language.finish",{locale:locale[0]}))).then(msg => {
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

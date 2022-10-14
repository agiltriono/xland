// Check bot time
const { embeds } = require(".././../util/util");
const i18n = require(".././../util/i18n");

module.exports.help = {
  name: "uptime",
  aliases: ["up-running"],
  usage: "",
  cooldown: 3,
  category: "Utility",
  permissions: ["ADMINISTRATOR"],
  description: "utility.uptime.description"
}
module.exports.run = async (msg, args) => {
  try {
    
    var totalSeconds = (msg.client.uptime / 1000);
    var days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    var hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = Math.floor(totalSeconds % 60);
    var time = [];
    
    if (days != 0) {
      time.push(`${days} days`)
    }
    if(hours != 0) {
      time.push(`${hours} hours`)
    }
    if (minutes != 0) {
      time.push(`${minutes} minutes`)
    }
    if (seconds != 0) {
      time.push(`${seconds} seconds`)
    }
    return await msg.reply(embeds(`🕛 UPTIME : ${time.map(o=>o).join(", ")}`));
		
  } catch (error) {
    console.log(error)
  }
}
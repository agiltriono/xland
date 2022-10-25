const i18n = require(".././../util/i18n");
const { database , embeds } = require(".././../util/util")
const shuffle = require(".././../util/shuffle-array");
const db = database.ref("guild")

module.exports.help = {
  name: "slots",
  aliases: ["lucky"],
  cooldown: 3600,
  category: "Games",
  multiplayer: false,
  usage: "",
  permissions: ["SEND_MESSAGES"],
  description: "games.slots.description"
}

exports.run = async function(msg, args , creator, client) {
  if (!msg.guild.me.permissions.has("SEND_MESSAGES")) return msg.reply(i18n.__mf("common.command.permissions.missing",{perm:"`SEND_MESSAGES`"}));
  const result = [];
  const slots = ['🍓', '🍕', '🍉', '🍘', '🍔'];
  var prize = 0;
  for(let i = 0; i < 3 ;i++) {
    result.push(shuffle.pick(slots,{'pick':1}))
  }
  switch(result[0]) {
	    case slots[0]:
	      prize = 300
	      break;
	    case slots[1]:
	      prize = 200
	      break;
	    case slots[2]:
	      prize = 100
	      break;
	    case slots[3]:
	      prize = 50
	      break;
	    case slots[4]:
	      prize = 25
	      break;
	    default:
	      break;
	  }
	if (result[0] == result[1] && result[0] == result[2]) {
	  msg.reply(embeds(i18n.__mf("games.slots.win", { result: `${result[0]}|${result[1]}|${result[2]}`, prize : prize })));
	} else {
	  msg.reply(embeds(i18n.__mf("games.slots.lose", { result: `${result[0]}|${result[1]}|${result[2]}` })));
	}
}
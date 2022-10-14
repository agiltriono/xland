const i18n = require(".././../util/i18n");

module.exports.help = {
  name: "avatar",
  aliases: ["ava", "profile", "picture", "pic"],
  cooldown: 10,
  category: "Info",
  usage: "(@mention)",
  permissions: ["SEND_MESSAGES","ATTACH_FILES"],
  description: "info.avatar.description"
}

module.exports.run = async (msg, args) => {
  if (!msg.guild.me.permissions.has("SEND_MESSAGES") && !msg.guild.me.permissions.has("ATTACH_FILES")) return msg.reply(i18n.__("common.command.permissions.missing",{perm:"`SEND_MESSAGES`,`ATTACH_FILES`"}));
  var regex = /^<@!?[0-9]*>$/gm;
  
  if (!args.length) {
     let embeds = {
        image: {
          url: msg.author.displayAvatarURL({ 
            dynamic : true,
            size : 512
          })
        }
      }
      msg.channel.send({ embeds : [embeds] })
  } else {
    if (!regex.test(args[0])) {
      msg.reply(i18n.__("common.command.invalid"))
    } else {
      var IDstring = args[0].replace(/[\\<>@#&!]/g, "");
      var user = msg.client.users.cache.get(IDstring);
      let embeds = {
        description: i18n.__mf("info.avatar.embed.mention", { author : msg.author.id, target : user.id }),
        image: {
          url: user.displayAvatarURL({ dynamic : true,
            size : 512
          })
        }
      }
      msg.channel.send({ embeds : [embeds] })
    }
  }
}
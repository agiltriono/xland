const { database, clear, remove, embeds } = require(".././../util/util");
const i18n = require(".././../util/i18n");
const db = database.ref("guild");

module.exports.help = {
  name: "suggestion",
  aliases: ["suggest"],
  cooldown: 3,
  category: "Misc",
  usage: "setting | suggestion",
  permissions: ["VIEW_CHANNEL","SEND_MESSAGES", "EMBED_LINKS"],
  description: "misc.suggestion.description"
}

exports.run = async (msg, args, creator) => {
  const msgId = msg.id
  db.child(msg.guild.id).once("value", (snapshoot) => {}).then(async server => {
    if(!args.length) return msg.reply(i18n.__("common.command.invalid"));
    if(args[0].toLowerCase() === "setting") return setting(msg, creator);
    const suggestionChannel = server.child("suggestionChannel").val();
    if (!suggestionChannel) return msg.reply(i18n.__("common.notAvailable"));
    if (msg.channel.id != suggestionChannel) return msg.reply(i18n.__("misc.suggestion.notinchannel"));
    if (!msg.guild.me.permissions.has("SEND_MESSAGES") && !msg.guild.me.permissions.has("VIEW_CHANNEL") && !msg.guild.me.permissions.has("EMBED_LINKS")) return msg.reply("common.command.permissions.missing",{perm:"`SEND_MESSAGES`,`VIEW_CHANNEL`,`EMBED_LINKS`"});
    if (!msg.member.permissions.has("SEND_MESSAGES") && !msg.member.permissions.has("VIEW_CHANNEL")) return msg.reply(i18n.__("common.command.permissions.denied"));
    const suggest = args.join(" ");
    const m = await msg.channel.send({embeds: [{
      author: {
        name : 'Sending..', 
        icon_url: msg.author.displayAvatarURL({format:"jpg"})
      }
    }], components: []})
    const uuid = msg.client.genId(11);
    const embed = new msg.client.discord.MessageEmbed()
    .setAuthor(msg.author.username, msg.author.displayAvatarURL({format:"jpg"}))
    .setTitle("Suggestion")
    .setDescription(suggest.toString())
    .addFields(
      {
        name: `Upvote`,
        value: `0 user`,
        inline: true
      },
      {
        name: `Downvote`,
        value: `0 user`,
        inline: true
    })
    .setTimestamp()
    .setFooter(msg.guild.name,msg.guild.iconURL());
    const row = new msg.client.discord.MessageActionRow()
      .addComponents(
        new msg.client.discord.MessageButton()
        .setCustomId(`upvote_${uuid}_0`)
        .setLabel('UPVOTE')
        .setEmoji('⬆️')
        .setStyle('PRIMARY'),
        new msg.client.discord.MessageButton()
        .setCustomId(`downvote_${uuid}_0`)
        .setLabel('DOWNVOTE')
        .setEmoji('⬇️')
        .setStyle('SECONDARY'));
    await m.edit({embeds:[embed], components: [row]})
    await remove(msg, msgId)
  })
}

async function setting (msg, creator) {
  db.child(msg.guild.id).once("value", (snapshoot) => {}).then(async(data) => {
    const exit = i18n.__("exit")
    const messages = []
    const channel = data.child("suggestionChannel").val();
    const message = await msg.channel.send(embeds(i18n.__mf("misc.suggestion.info",{channel:channel ? `<#${channel}>` : `\`${i18n.__("common.command.none")}\`` })));
    messages.push(message.id)
    const filter = m => m.content && m.author.id === creator.id;
    const c = msg.channel.createMessageCollector({
      filter,
      time: 30000
    })
    var content = ""
    c.on("collect", async m => {
      content = m.content
      await clear(m)
      if (content.toLowerCase() === exit.toLowerCase()) {
        await c.stop("exit")
      } else if ((/^<#!?[0-9]*>$/).test(content)) {
        await db.child(msg.guild.id).update({
          suggestionChannel : content.replace(/[\\<>@#&!]/gm, "")
        })
        await c.stop("complete")
      } else {
        msg.reply(i18n.__("common.command.invalid")).then(ms => {
          clear(ms, 2000)
        })
      }
    })
    c.on("end", async(collected, reason) => {
      switch(reason) {
        case 'exit':
        case 'time':
          await remove(msg, messages[0])
          break;
        case 'complete':
          msg.channel.send(`Suggestion Channel : ${content}`).then(async ms => {
            await remove(msg, messages[0])
            await clear(ms, 3000)
          })
          break;
      }
    })
  })
}
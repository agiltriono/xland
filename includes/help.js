const { embeds, getmsg, remove } = require("../util/util"); 
const i18n = require("../util/i18n");
const fs = require("fs");
const colorful = require("../util/color");
module.exports = async function help(msg, args, creator, mention, prefix) {
  if (!args.length) {
    if (mention) {
      msg.reply(embeds(i18n.__mf("help.info",{
        prefix: prefix
      })));
    } else {
  	  commandhelp(msg, creator, prefix)
    }
  } else {
		var cmd = undefined;
		if (msg.client.commands.has(args[0])) {
			cmd = msg.client.commands.get(args[0]);
		} else if (msg.client.aliases.has(args[0])) {
			cmd = msg.client.commands.get(msg.client.aliases.get(args[0]));
		}
		if(typeof cmd == "undefined") {
		  msg.channel.send({ embeds : [{
  		  title: i18n.__("common.command.invalid"), 
  		  description: i18n.__mf("common.command.helper.global", { prefix : prefix })
		  }]})
		} else {
  		var command = cmd.help;
  		msg.channel.send({
  		  embeds: [{
    		  author: {
    		    name: i18n.__mf("help.embed.author", { author: msg.client.user.username }), 
    		    icon_url: msg.client.user.displayAvatarURL()
    		  },
    		  title: i18n.__mf("help.command.title", { commandName : command.name.slice(0, 1).toUpperCase() + command.name.slice(1) }),
    		  description: i18n.__mf("help.command.list", { h_name : command.name, h_desc : i18n.__(command.description) || i18n.__("common.command.nodescription"), h_use : command.usage ? prefix+command.name+" "+command.usage : i18n.__("common.command.nousage"), h_alias : command.aliases ? command.aliases.join(", ") : i18n.__("common.command.none"), h_cat : command.category }),
    		  footer: {
    		    text: i18n.__mf("help.embed.footer", { author: msg.author.tag }), 
    		    icon_url: msg.author.displayAvatarURL()
    		  },
    		  color: colorful()
  		  }]
  		});
		}
	}
}

async function commandhelp(msg, creator, prefix) {
  var fields = [];
  var messages = [];
  var button = [
    new msg.client.discord.MessageButton().setCustomId('prev').setLabel(i18n.__("prev")).setStyle('SUCCESS').setDisabled(true),
    new msg.client.discord.MessageButton().setCustomId('next').setLabel(i18n.__("next")).setStyle('SUCCESS'),
    new msg.client.discord.MessageButton().setCustomId('cancel').setLabel(i18n.__("cancel")).setStyle('DANGER')
    ]
  var row = {
    type: 1,
    components: button
  }
  var index = 0;
  var max = fields.length;
  var min = 0;
  fs.readdirSync("./commands/").forEach(category => {
		const dir = msg.client.commands.filter(obj => obj.help.category.toLowerCase() === category.toLowerCase());
	  const capitalise = category.slice(0, 1).toUpperCase() + category.slice(1);
    try {
      if (dir.size != 0) {
      	if (!msg.member.permissions.has("ADMINISTRATOR")) {
      	  if (category != "setting") {
        		fields.push({desc: `
        		**${capitalise}**\n\n${dir.map(obj => `**${prefix}${obj.help.name} ${obj.help.usage}**\n${i18n.__(obj.help.description)}`).join("\n\n\n")}`});
        		max = fields.length
      	  }
      	} else {
      		fields.push({desc: `
      		**${capitalise}**\n\n${dir.map(obj => `**${prefix}${obj.help.name} ${obj.help.usage}**\n${i18n.__(obj.help.description)}`).join("\n\n\n")}`});
      		max = fields.length
      	}
      }
  	} catch (err) {
  		console.log(err);
  	}
  });
  function prev () {
    index --;
    var prevObj = fields[index] ? fields[index] : null;
    if (!prevObj) return;
    if (index === min) return display(false, true, prevObj);
    return display(true, true, prevObj);
  }
  function next () {
    index++;
    var nextObj = fields[index] ? fields[index] : null;
    if (!nextObj) return;
    if (index === (max-1)) return display(true, false, nextObj);
    return display(true, true, nextObj);
  }
  function display(prev, next, obj) {
    if (!prev) {
      button[0].setDisabled(true);
    } else {
      button[0].setDisabled(false);
    }
    if (!next) {
      button[1].setDisabled(true);
    } else {
      button[1].setDisabled(false);
    }
    getmsg(msg, messages[0]).then(async(m)=> {
      await m.edit({
        embeds : [{
          description : obj.desc,
          footer: {
            text: i18n.__mf("help.page",{
              page: `${index+1}/${max}`
            }),
            icon_url: msg.client.users.cache.get(creator.id).displayAvatarURL({format:'jpg'})
          }
        }],
        components: [row]
      })
    })
  }
  if (msg.deferred == false){
    await msg.deferReply()
  };
  const message = await msg.channel.send({
    embeds : [{
      description : fields[index].desc,
      footer: {
        text: i18n.__mf("help.page",{
          page: `${index+1}/${max}`
        }),
        icon_url: msg.client.users.cache.get(creator.id).displayAvatarURL({format:'jpg'})
      }
    }],
    components: [row]
  })
  messages.push(message.id)
  const filter = async(m) => {
    await m.deferUpdate()
    return m.customId && m.user.id === creator.id;
  }
  const collector = message.createMessageComponentCollector({
    filter,
    componentType: 'BUTTON',
    time: 120000
  })
  collector.on("collect", async(m) => {
    switch (m.customId) {
      case 'prev':
        prev()
        collector.resetTimer()
        await m.deferUpdate()
        break;
      case 'next':
        next()
        collector.resetTimer()
        break;
      case 'cancel':
        collector.stop('cancel')
        break;
    }
  })
  collector.on("end", async (collected, reason) => {
    switch (reason) {
      case 'time':
      case 'cancel':
        await remove(msg, messages[0])
        break;
    }
  })
}
const { clear, getrole } = require(".././../util/util");
const i18n = require(".././../util/i18n");

module.exports.help = {
  name: "override",
  aliases: ["over"],
  cooldown: 3,
  usage: "override CATEGORY_ID",
  category: "Utility",
  permissions: ["ADMINISTRATOR"],
  description: "PERMISSIONS OVERRIDE"
}
module.exports.run = async (msg, args) => {
	if (!msg.guild.me.permissions.has("MANAGE_CHANNELS")) return msg.reply(i18n.__("common.command.permissions.missing",{perm:"`MANAGE_CHANNELS`"}));
	if (!msg.guild.me.permissions.has("MANAGE_ROLES")) return msg.reply(i18n.__("common.command.permissions.missing",{perm:"`MANAGE_ROLES`"}));
	if (!msg.member.permissions.has("ADMINISTRATOR")) return msg.reply(i18n.__("common.command.permissions.denied"));
	const arg = msg.content.slice(msg.client.prefix.length).trim().split(/ +/g);
	const commandName = arg.shift().toLowerCase();
	const command = msg.client.commands.get(commandName) || msg.client.commands.get(msg.client.aliases.get(commandName));
	if (!args.length){
	  msg.channel.send(i18n.__mf("common.command.helper.current", { prefix : msg.client.prefix, command : command.help.name })).then(msg => {
		clear(msg, 2000)
	  })
	} else {
		const ch_id = args[0];
		const cat = msg.guild.channels.cache.find(channel => channel.id.toString() == ch_id.toString())
		if (!cat) return msg.reply(`I can't find the category.`);
		
		// Permission Override Begin
		try {
		  await cat.permissionOverwrites.create(getrole(msg.guild,"silence").id,{
			SPEAK: false,
			ADD_REACTIONS: false,
			SEND_MESSAGES: false,
			REQUEST_TO_SPEAK: false,
			SEND_MESSAGES_IN_THREADS: false,
			USE_APPLICATION_COMMANDS: false
		  })
		  await cat.permissionOverwrites.create(getrole(msg.guild,"blocked").id,{
			VIEW_CHANNEL: false,
			READ_MESSAGE_HISTORY: false,
			USE_APPLICATION_COMMANDS: false,
			SPEAK: false,
			CONNECT: false,
			ADD_REACTIONS: false,
			SEND_MESSAGES: false,
			REQUEST_TO_SPEAK: false,
			SEND_MESSAGES_IN_THREADS: false,
			VIEW_AUDIT_LOG: false
		  })
		  await cat.permissionOverwrites.create(getrole(msg.guild,"unverified").id,{
			VIEW_CHANNEL: false,
			READ_MESSAGE_HISTORY: false,
			USE_APPLICATION_COMMANDS: false,
			SPEAK: false,
			CONNECT: false,
			ADD_REACTIONS: false,
			SEND_MESSAGES: false,
			REQUEST_TO_SPEAK: false,
			SEND_MESSAGES_IN_THREADS: false,
			VIEW_AUDIT_LOG: false
		  })
		  await msg.reply("Done.")
		} catch (error) {
		  return msg.reply("Create permission failed, i can\'t procced.")
		}
	}
}
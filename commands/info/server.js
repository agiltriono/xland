const i18n = require(".././../util/i18n");
const colorful = require(".././../util/color");

module.exports.help = {
  name: "server",
  aliases: ["guild"],
  cooldown: 5,
  category: "Info",
  usage: "",
  permissions: ["ADMINISTRATOR"],
  description: "info.server.description"
}

module.exports.run = async (msg, args) => {
  if (!msg.member.permissions.has("ADMINISTRATOR")) return msg.reply(i18n.__("common.command.permissions.denied"));
  const icon = {
    general: ":bookmark:",
    hash: ":hash:",
    gem: ":gem:",
    lock: ":lock:",
    list: ":black_small_square:"
  }
  const filterLevels = {
    DISABLED : "OFF", 
    MEMBERS_WITHOUT_ROLES: "No Role", 
    ALL_MEMBERS: "Everyone"
  };
  const verificationLevels = {
    NONE: 'None',
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: '(╯°□°）╯︵ ┻━┻',
    VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
  }
  var user = await msg.guild.members.fetch();
  var member = []
  var bot = []
  user.map(members => {
    if(!members.user.bot) return member.push('member');
  })
  user.map(members => {
    if (members.user.bot) return bot.push('bot');
  })
  var embed = [{
		thumbnail : {
			url: msg.guild.iconURL()
		},
		fields : [
			{
			  name: `${icon.general} General`,
			  value: [
          {
      		  value : `${icon.list} Name: ${msg.guild.name}`
      		},
      		{
      		  value : `${icon.list} ID: ${msg.guild.id}`
      	  },
      		{
      		  value: `${icon.list} Creation Date: ${msg.guild.createdAt.toDateString()}`
      		},
      		{
      		  value: `${icon.list} Owner: <@${msg.guild.ownerId}>`
      		},
      		{
      		  value: `${icon.list} Members: ${member.length}`
      		},
      		{
      		  value: `${icon.list} Bot: ${bot.length}`
      		},
      		{
      		  value: `${icon.list} Roles: ${msg.guild.roles.cache.size}`
      		}
        ].map(obj => obj.value).join("\n"),
			  inline: true
			},
			{
			  name: `${icon.hash} Channel`,
			  value: [
          {
      	    value: `${icon.list} Text Channels: ${msg.guild.channels.cache.filter(channel => channel.type === "GUILD_TEXT").size}`
      		},
      		{
      			value: `${icon.list} Voice Channels: ${msg.guild.channels.cache.filter(channel => channel.type === "GUILD_VOICE").size}`
        	},
      		{
      			value: `${icon.list} Channels Category: ${msg.guild.channels.cache.filter(channel => channel.type === "GUILD_CATEGORY").size}`
      	  }
        ].map(obj => obj.value).join("\n"),
			  inline: true
			},
			{
			  name : `${icon.gem} Nitro`,
			  value: [
          {
      		  value: `${icon.list} Boost: ${msg.guild.premiumSubscriptionCount}`
      		},
      		{
      		  value: `${icon.list} Boost Level: ${msg.guild.premiumTier}`
      	  },
        ].map(obj => obj.value).join("\n"),
			  inline : true
			},
			{
			  name: `${icon.lock} Security`,
			  value: [
          {
      			 value: `${icon.list} Verification Level: ${verificationLevels[msg.guild.verificationLevel]}`
      	  },
      	  {
      			 value: `${icon.list} Explicit Filter: ${filterLevels[msg.guild.explicitContentFilter]}`
      		}
        ].map(obj => obj.value).join("\n"),
			  inline: true
			}
	  ],
	  color: colorful()
  }];
	msg.reply({ embeds : embed });
}
const { database, getmsg, clear, remove } = require(".././../util/util");
const i18n = require(".././../util/i18n");
const db = database.ref("guild");
var cancel,back,apply,deleted,add,fn;
module.exports.help = {
  name: "ticket",
  aliases: ["support-ticket"],
  cooldown: 3,
  category: "Misc",
  usage: "setting | open (description) | add <@mention> | remove <@mention>",
  permissions: ["VIEW_CHANNEL","SEND_MESSAGES", "EMBED_LINKS","MANAGE_CHANNELS"],
  description: "misc.ticket.description"
}

exports.run = async (msg, args, creator) => {
  cancel = i18n.__("cancel");
  back = i18n.__("back");
  apply = i18n.__("apply");
  deleted = i18n.__("delete");
  add = i18n.__("add");
  if ((!msg.guild.me.permissions.has("SEND_MESSAGES") && !msg.guild.me.permissions.has("EMBED_LINKS")) || (!msg.guild.me.permissions.has("MANAGE_CHANNELS") && !msg.guild.me.permissions.has("VIEW_CHANNEL"))) return msg.reply("common.command.permissions.missing",{perm:"`SEND_MESSAGES`,`EMBED_LINKS`,`MANAGE_CHANNELS`,`VIEW_CHANNEL`"});
  if (!args.length) return msg.reply(i18n.__("common.command.invalid"));
  if (args[0].toLowerCase() === "setting") return setting(msg, creator);
  if (args[0].toLowerCase() === "open") return open(msg, args, creator);
  if (args[0].toLowerCase() === "add") return add(msg, args, creator);
  if (args[0].toLowerCase() === "remove") return del(msg, args, creator);
}
async function add(msg, args, creator) {
  const msgId = msg.id;
  db.child(msg.guild.id).once("value", (snapshoot) => {}).then(async data => {
    const regex = /^<@!?[0-9]*>$/;
    const target = args[1] ? args.slice(1).join("") : null;
    const ticket = data.child("ticket");
    const channel = ticket.child("channel").val()
    if (!regex.test(target)) return msg.reply("common.command.invalid");
    if (!channel) return msg.reply(i18n.__mf("misc.ticket.notset",{value:"`CHANNEL`"}));
    if (msg.channel.id != channel) return msg.reply(i18n.__("misc.ticket.notinchannel"));
    const member = await msg.guild.members.fetch(target.replace(/[\\<>@#&!]/gm, ""))
    if (!member) return msg.reply(i18n.__("common.command.invalid"));
    const ow = msg.channel.permissionOverwrites.get(member.user.id)
    if (!ow) {
      await remove(msg, msgId)
      await msg.channel.permissionOverwrites.create(member.user.id,{
        VIEW_CHANNEL: true,
        SEND_MESSAGES:false
      })
      msg.reply(i18n.__("misc.ticket.useradded")).then(m => {
        clear(m, 2000)
      })
    } else {
      msg.reply(i18n._("misc.ticket.useralreadyexist")).then(m => {
        clear(m, 2000)
      })
    }
  })
}
async function del(msg, args, creator) {
  const msgId = msg.id;
  db.child(msg.guild.id).once("value", (snapshoot) => {}).then(async data => {
    const regex = /^<@!?[0-9]*>$/;
    const target = args[1] ? args.slice(1).join("") : null;
    const ticket = data.child("ticket");
    const channel = ticket.child("channel").val();
    if (!regex.test(target)) return msg.reply("common.command.invalid");
    if (!channel) return msg.reply(i18n.__mf("misc.ticket.notset",{value:"`CHANNEL`"}));
    if (msg.channel.id != channel) return msg.reply(i18n.__("misc.ticket.notinchannel"));
    const member = await msg.guild.members.fetch(target.replace(/[\\<>@#&!]/g, ""))
    if (!member) return msg.reply(i18n.__("common.command.invalid"));
    const ow = msg.channel.permissionOverwrites.get(member.user.id)
    if (ow) {
      await remove(msg, msgId)
      await msg.channel.permissionOverwrites.delete(member.user.id)
      msg.reply(i18n.__("misc.ticket.userremoved")).then(m => {
        clear(m, 2000)
      })
    } else {
      msg.reply(i18n._("misc.ticket.usernotexist")).then(m => {
        clear(m, 2000)
      })
    }
  })
}
async function open(msg, args, creator) {
  const Permissions = msg.client.discord.Permissions;
  const msgId = msg.id
  db.child(msg.guild.id).once("value", (snapshoot) => {}).then(async data => {
    const ticket = data.child("ticket");
    const channel = ticket.child("channel").val()
    const category = ticket.child("category").val()
    const topic = ticket.child("topic").val()
    const moderator = ticket.child("moderator").val()
    if (!msg.guild.channels.cache.get(channel)) return msg.reply(i18n.__mf("misc.ticket.notset",{value:"`CHANNEL`"}));
    if (!category) return msg.reply(i18n.__mf("misc.ticket.notset",{value:"`CATEGORY`"}));
    if (!moderator) return msg.reply(i18n.__mf("misc.ticket.notset",{value:"`MODERATOR`"}));
    if (!topic) return msg.reply(i18n.__mf("misc.ticket.notset",{value:"`TOPIC`"}));
    if (msg.channel.id != channel) return msg.reply(i18n.__("misc.ticket.notinchannel"));
    const description = args[1] ? args.slice(1).join(" ") : "Click button down below to open ticket.";
    const m = await msg.guild.channels.cache.get(channel).send({embeds: [{
      author: {
        name : 'Opening ticket..', 
        icon_url: msg.author.displayAvatarURL({format:"jpg"})
      }
    }], components: []})
    const embed = new msg.client.discord.MessageEmbed()
    .setAuthor(msg.author.username, msg.author.displayAvatarURL({format:"jpg"}))
    .setTitle("Ticket")
    .setDescription(description)
    .setTimestamp()
    .setFooter(msg.guild.name,msg.guild.iconURL());
    const row = new msg.client.discord.MessageActionRow()
      .addComponents(
        new msg.client.discord.MessageButton()
        .setCustomId(`open_ticket_${msg.client.genId(11)}`)
        .setLabel('OPEN TICKET')
        .setEmoji('✉️')
        .setStyle('PRIMARY'))
    remove(msg, msgId)
    m.edit({embeds:[embed], components: [row]}).then(() => {
      msg.guild.channels.cache.forEach(async c => {
        if (c.id == channel || c.id == category) {
          await c.permissionOverwrites.create(moderator,{
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true
          })
          await c.permissionOverwrites.create(msg.guild.roles.everyone,{
            VIEW_CHANNEL: false,
            SEND_MESSAGES: false
          })
        }
      })
    })
  })
}
async function setting (msg, creator) {
  if (!msg.member.permissions.has("ADMINISTRATOR")) return msg.reply(i18n.__("common.command.permissions.denied"));
  return db.child(msg.guild.id).once("value", (snapshoot) => {}).then(async data => {
    const ticket = data.child("ticket");
    const channel = ticket.child("channel").val()
    const category = ticket.child("category").val()
    const topic = ticket.child("topic").val()
    const moderator = ticket.child("moderator").val()
    const messages = []
    const row = {
      type: 1,
      components: [
        new msg.client.discord.MessageButton().setCustomId("setChannel").setLabel("Channel").setStyle('PRIMARY'),
        new msg.client.discord.MessageButton().setCustomId("setCategory").setLabel("Category").setStyle('PRIMARY'),
        new msg.client.discord.MessageButton().setCustomId("setTopic").setLabel("Topic").setStyle('PRIMARY'),
        new msg.client.discord.MessageButton().setCustomId("setModerator").setLabel("Moderator").setStyle('PRIMARY'),
        new msg.client.discord.MessageButton().setCustomId('cancel').setLabel(i18n.__("cancel")).setStyle('DANGER')]
    }
    const embed = { 
      embeds : [{
        description: i18n.__mf("misc.ticket.setting",{
          current : `**Channel:** ${channel ? `<#${channel}>` : i18n.__("notset")}\n**Category:** ${category ? `<#${category}>` : i18n.__("notset")}\n**Topic:** ${topic ? topic : i18n.__("notset")}\n**Moderator:** ${moderator ? `<@&${moderator}>` : i18n.__("notset")}`
        })
      }],
      components: [row]
    }
    const message = await msg.channel.send(embed);
    messages.push(message.id)
    const filter = async m => {
      await m.deferUpdate();
      return m.customId && m.customId && m.user.id === creator.id;
    }
    const c = message.createMessageComponentCollector({
      filter,
      componentType : 'BUTTON',
      time : 60000
    })
    
    c.on('collect', async (m) => {
      var id = m.customId;
      return await c.stop(id)
    })
    c.on('end', (collected, reason) => {
      if (reason === 'time') {
        msg.channel.send(i18n.__('common.commandTimeout'))
      } else if (reason === 'cancel') {
        remove(msg, messages[0])
      } else {
        remove(msg, messages[0]);
        fn[reason](msg, creator)
      }
    })
  })
}
fn = {
  setTopic : async function (msg, creator) {
    db.child(msg.guild.id).once("value", (snapshoot) => {}).then(async (data) => {
      var mytopic = [];
      var messages = [];
      var ticket = data.child('ticket');
      var topic = ticket.child("topic").val();
      if (topic != null) {
        mytopic = topic.split(",")
      }
      function update() {
        getmsg(msg, messages[0]).then(m => {
          m.edit({
            embeds : [{
              title: "TOPIC",
              description: i18n.__mf("misc.ticket.topic",{
                topic: `${mytopic.length ? mytopic.map(o => `\`${o}\``).join(",") : i18n.__("notset")}`
              })
            }]
          })
        })
      }
      msg.channel.send({
        embeds : [{
          title: "TOPIC",
          description: i18n.__mf("misc.ticket.topic",{
            topic: `${mytopic.length ? mytopic.map(o => `\`${o}\``).join(",") : i18n.__("notset")}`
          })
        }]
      }).then (m => {
        messages.push(m.id)
      })
      const filter = m => m.content && m.author.id === creator.id;
      const collector = msg.channel.createMessageCollector({
        filter,
        time: 60000
      })
      var content = ''
      collector.on("collect", m => {
        content = m.content.toLowerCase()
        clear(m)
        if (content == apply.toLowerCase()) {
          db.child(msg.guild.id).child("ticket").update({
            topic : mytopic.map(o => o).join(",")
          }).then(() => {
            collector.stop('apply')
          })
        } else if (content == back.toLowerCase()) {
          collector.stop('back')
        } else if(content == cancel.toLowerCase()) {
          collector.stop('cancel')
        } else if (content.startsWith(add.toLowerCase())) {
          const a = content.slice(add.toLowerCase().length).trim().split(/ +/g);
          if (a.length) {
            if (a.length > 1) {
              for (let i = 0; i < a.length; i++) {
                mytopic.push(a[i])
              }
              update()
              collector.resetTimer()
            } else {
              mytopic.push(a[0])
              update()
              collector.resetTimer()
            }
          } else {
            msg.reply(i18n.__("common.command.invalid"))
          }
        } else if (content.startsWith(deleted.toLowerCase())) {
          const b = content.slice(deleted.toLowerCase().length).trim().split(/ +/g).join("");
          if (b) {
            let rm = mytopic.filter(o => o != b);
            mytopic = rm;
            update()
            collector.resetTimer()
          }
        }
      })
      collector.on("end", (collected, reason) => {
        switch(reason) {
          case 'cancel':
          case 'time':
            remove(msg, messages[0])
            break;
          case 'apply':
          case 'back':
            remove(msg, messages[0])
            setting(msg, creator)
            break;
        }
      })
    })
  },
  setChannel : async function (msg, creator) {
    const messages = []
    const ch = [];
    msg.guild.channels.cache.forEach(async c => {
      if (c.type === "GUILD_TEXT") {
        await ch.push({
          label:c.name,
          value:c.id
        })
      }
    })
    const row = new msg.client.discord.MessageActionRow()
      .addComponents(new msg.client.discord.MessageSelectMenu()
        .setCustomId(`select_channel_${msg.channel.id}`)
        .setPlaceholder('Select a channel')
        .addOptions(ch));
    const embed = {
      embeds : [{
        title: "CHANNEL",
        description: i18n.__("misc.ticket.channel")
      }],
      components: [row]
    }
    const message = await msg.channel.send(embed);
    messages.push(message.id)
    const filter = async m => {
      await m.deferUpdate()
      return m.customId && m.user.id === creator.id;
    }
    const c = message.createMessageComponentCollector({
      filter,
      componentType: "SELECT_MENU",
      time: 60000
    })
    var selected = ""
    c.on("collect", async m => {
      selected = m.values[0]
      if (m.values[0]) {
        await db.child(msg.guild.id).child("ticket").update({
          channel : m.values[0]
        })
        await c.stop(selected)
      }
    })
    c.on("end", async(collected, reason) => {
      switch(reason) {
        case 'cancel':
        case 'time':
          await remove(msg, messages[0])
          break;
        case selected:
          await remove(msg, messages[0])
          setting(msg, creator)
          break;
      }
    })
  },
  setCategory : async function (msg, creator) {
    const messages = []
    const ch = [];
    msg.guild.channels.cache.forEach(async c => {
      if (c.type === "GUILD_CATEGORY") {
        await ch.push({
          label:c.name,
          value:c.id
        })
      }
    })
    const row = new msg.client.discord.MessageActionRow()
      .addComponents(new msg.client.discord.MessageSelectMenu()
        .setCustomId(`select_category_${msg.channel.id}`)
        .setPlaceholder('Select a category')
        .addOptions(ch));
    const embed = {
      embeds : [{
        title: "CATEGORY",
        description: i18n.__("misc.ticket.category")
      }],
      components: [row]
    }
    const message = await msg.channel.send(embed);
    messages.push(message.id)
    const filter = async m => {
      await m.deferUpdate()
      return m.customId && m.user.id === creator.id;
    }
    const c = message.createMessageComponentCollector({
      filter,
      componentType: "SELECT_MENU",
      time: 60000
    })
    var selected = ""
    c.on("collect", async m => {
      selected = m.values[0]
      if (m.values[0]) {
        await db.child(msg.guild.id).child("ticket").update({
          category : m.values[0]
        })
        await c.stop(selected)
      }
    })
    c.on("end", async(collected, reason) => {
      switch(reason) {
        case 'cancel':
        case 'time':
          await remove(msg, messages[0])
          break;
        case selected:
          await remove(msg, messages[0])
          setting(msg, creator)
          break;
      }
    })
  },
  setModerator : async function (msg, creator) {
    const messages = []
    const role = [];
    msg.guild.roles.cache.forEach(async r => {
      await role.push({
        label: r.name,
        value: r.id
      })
    })
    const row = new msg.client.discord.MessageActionRow()
      .addComponents(new msg.client.discord.MessageSelectMenu()
        .setCustomId(`select_moderator_${msg.channel.id}`)
        .setPlaceholder('Select a role')
        .addOptions(role));
    const embed = {
      embeds : [{
        title: "MODERATOR",
        description: i18n.__("misc.ticket.moderator")
      }],
      components: [row]
    }
    const message = await msg.channel.send(embed);
    messages.push(message.id)
    const filter = async m => {
      await m.deferUpdate()
      return m.customId && m.user.id === creator.id;
    }
    const c = message.createMessageComponentCollector({
      filter,
      componentType: "SELECT_MENU",
      time: 60000
    })
    var selected = ""
    c.on("collect", async m => {
      selected = m.values[0]
      if (m.values[0]) {
        await db.child(msg.guild.id).child("ticket").update({
          moderator : m.values[0]
        })
        await c.stop(selected)
      }
    })
    c.on("end", async(collected, reason) => {
      switch(reason) {
        case 'cancel':
        case 'time':
          await remove(msg, messages[0])
          break;
        case selected:
          await remove(msg, messages[0])
          setting(msg, creator)
          break;
      }
    })
  }
}
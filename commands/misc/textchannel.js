const { database, clear, remove } = require(".././../util/util");
const i18n = require(".././../util/i18n");
const db = database.ref("guild");

module.exports.help = {
  name: "txt",
  aliases: ["textchannel"],
  cooldown: 3,
  category: "Misc",
  usage: "setup | rename | remove | allowrole @role",
  permissions: [
    "VIEW_CHANNEL",
    "SEND_MESSAGES",
    "EMBED_LINKS",
    "MANAGE_CHANNELS",
  ],
  description:
    "Command ini berfungsi untuk membuat sebuah text channel untuk sementara.",
};

exports.run = async (msg, args, creator) => {
  await msg.delete();
  if (
    (!msg.guild.me.permissions.has("SEND_MESSAGES") &&
      !msg.guild.me.permissions.has("EMBED_LINKS")) ||
    (!msg.guild.me.permissions.has("MANAGE_CHANNELS") &&
      !msg.guild.me.permissions.has("VIEW_CHANNEL"))
  )
    return msg
      .reply("common.command.permissions.missing", {
        perm: "`SEND_MESSAGES`,`EMBED_LINKS`,`MANAGE_CHANNELS`,`VIEW_CHANNEL`",
      })
      .then(async (m) => {
        await clear(m, 2000);
      });
  if (!args.length)
    return msg.reply(i18n.__("common.command.invalid")).then(async (m) => {
      await clear(m, 2000);
    });
  if (args[0].toLowerCase() === "setup") {
    if (msg.member.permissions.has("ADMINISTRATOR"))
      return create(msg, args, creator);
    if (msg.guild.ownerId === creator.id) return create(msg, args, creator);
    return;
  }
  if (args[0].toLowerCase() === "remove") {
    return del(msg, args, creator);
  }
  if (args[0].toLowerCase() === "rename") {
    var argument = args;
    argument.shift();
    argument = argument.filter((item) => item);
    if (!argument.length) return;
    return rename(msg, argument, creator);
  }
  if (args[0].toLowerCase() === "allowrole") {
    var argument = args;
    argument.shift();
    argument = argument.filter((item) => item);
    if (!argument.length) return;
    if (msg.member.permissions.has("ADMINISTRATOR"))
      return allowrole(msg, argument, creator);
    if (msg.guild.ownerId === creator.id)
      return allowrole(msg, argument, creator);
    return;
  }
};

async function allowrole(msg, args, creator) {
  if (args.length > 1) {
    let list = args;
    let count = [];
    let array = [];
    for (let i = 0; i < list.length; i++) {
      count.push(i);
      if (list[i]) {
        await array.push(list[i].trim().replace(/[\\<>@#&!]/g, ""));
      }
      if (list.length === count.length) {
        let rolelist = array.join(",").replace(/ +/, "");
        db.child(msg.guild.id).child("text_room").update({
          allowrole: rolelist,
        });
        break;
      }
    }
  } else {
    let rolelist = args[0].replace(/[\\<>@#&!]/g, "");
    db.child(msg.guild.id)
      .child("text_room")
      .update({
        allowrole: rolelist.replace(/ +/, ""),
      });
  }
  msg.channel
    .send(":white_check_mark: Role berhasil di update.")
    .then(async (m) => {
      await clear(m, 2000);
    });
}

async function del(msg, args, creator) {
  const channelid = msg.channel.topic.trim();
  const author = creator.id;
  if (channelid === author) {
    await msg.channel.delete();
  } else {
    return;
  }
}

async function rename(msg, args, creator) {
  const topic = msg.channel.topic.trim();
  const author = creator.id;
  const nama = args.length > 1 ? args.join(" ") : args.join("");
  if (topic === author) {
    const channel = await msg.guild.channels.resolve(msg.channel.id);
    if (!channel) return;
    channel
      .setName(`👑-${nama.trim().toLowerCase()}`)
      .then((c) => {
        c.send(`:white_check_mark: Nama room di ganti ke **${c.name}**`)
          .then((m) => clear(m, 3000))
    })
      .catch(console.error);
  } else {
    return;
  }
}

async function create(msg, args, creator) {
  const embed = new msg.client.discord.MessageEmbed()
    .setTitle("ROOM MAKER")
    .setDescription(
      `**Room Master** : Pemilik room dapat menghapus channel\n**Hapus Room**: Gunakan command \`${msg.client.prefix}txt remove\` saat berada di dalam room\n**Ganti Nama Room**: Gunakan command\`${msg.client.prefix}txt rename (name)\` saat berada di dalam room`
    )
    .setColor("BLACK");
  const row = new msg.client.discord.MessageActionRow().addComponents(
    new msg.client.discord.MessageButton()
      .setCustomId(`buat_channel_${msg.client.genId(11)}`)
      .setLabel("Buat Room")
      .setEmoji("✏️")
      .setStyle("SECONDARY")
  );
  await msg.channel.send({ embeds: [embed], components: [row] });
}

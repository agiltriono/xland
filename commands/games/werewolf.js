const { MessageActionRow, Modal, TextInputComponent, MessageButton } = require("discord.js");
const fs = require("fs");
const path = require("path");
const i18n = require(".././../util/i18n");
const { database, TIMER_GIF, getmsg, clear, embeds, remove, games, color } = require(".././../util/util");
const help = require(".././../includes/werewolf.js");
const db = database.ref("guild");
const shuffle = require(".././../util/shuffle-array");
var mati = ":skull:"
var hidup = ":green_circle:"
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}
module.exports.help = {
  name: "ww",
  aliases: ["werewolf"],
  cooldown: 10,
  category: "Games",
  multiplayer: true,
  usage: "ww || ww how2play",
  permissions: ["SEND_MESSAGES"],
  description: "Ketika berkumpul bersama teman di discord ada kalanya merasa bosan dan ingin melakukan sebuah permainan untuk mencairkan suasana. Nah bisa dengan coba bermain werewolf dan cara bermain werewolf cukup mudah, sehingga bisa dimainkan oleh segala usia."
}
function randomize(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}
function roles(name) {
	let role = [
		{
			name: 'villager',
			emoji: "<:villager:1031680738451521578>",
			id: "1031680738451521578"
		},
		{
			name: 'werewolf',
			emoji: "<:werewolf:1031680743539232788>",
			id: "1031680743539232788"
		},
		{
			name: 'seer',
			emoji: "<:seer:1031680733212835860>",
			id: "1031680733212835860"
		},
		{
			name: 'guardian',
			emoji: "<:guardian:1031680707476586536>",
			id: "1031680707476586536"
		},
		{
			name: 'hunter',
			emoji: "<:Headhunter:1031680714976002099>",
			id: "1031680714976002099"
		}
	]
	return role.find(r => r.name === name)
}

function emoji(no) {
	let emo = [
	  {
		emoji: "<:1_:1031215481371246592>",
		id: "1031215481371246592"
	  },
	  {
		emoji: "<:2_:1031215484529545318>",
		id: "1031215484529545318"
	  },
	  {
		emoji: "<:3_:1031215486337294468>",
		id: "1031215486337294468"
	  },
	  {
		emoji: "<:4_:1031215489428488402>",
		id: "1031215489428488402"
	  },
	  {
		emoji: "<:5_:1031215491936698398>",
		id: "1031215491936698398"
	  },
	  {
		emoji: "<:6_:1031215494822371468>",
		id: "1031215494822371468"
	  },
	  {
		emoji: "<:7_:1031215497536077965>",
		id: "1031215497536077965"
	  },
	  {
		emoji: "<:8_:1031215499712929792>",
		id: "1031215499712929792"
	  },
	  {
		emoji: "<:9_:1031215502372122724>",
		id: "1031215502372122724"
	  },
	  {
		emoji: "<:10_:1031215506688061671>",
		id: "1031215506688061671"
	  },
	  {
		emoji: "<:11_:1031215509506621510>",
		id: "1031215509506621510"
	  },
	  {
		emoji: "<:12_:1031215511859642428>",
		id: "1031215511859642428"
	  },
	  {
		emoji: "<:13_:1031215514720153620>",
		id: "1031215514720153620"
	  },
	  {
		emoji: "<:14_:1031215517308039280>",
		id: "1031215517308039280"
	  },
	  {
		emoji: "<:15_:1031215519577157632>",
		id: "1031215519577157632"
	  }
	]
	return emo[no]
}

function playerlist(player, tamat){
	var pemain;
	if (tamat == false) {
	  let kehidupan = player.filter(u=>u.status === hidup)
	  let kematian = player.filter(u=>u.status === mati)
		pemain = `**Alam Kehidupan**\n${kehidupan.map(u=>`${u.status} <@${u.id}> ${u.saved_by != "" ? `**Saved by ${u.saved_by.capitalize()}**` : ""}`).join("\n")}\n**Alam Kematian**\n${kematian.length != 0 ? kehidupan.map(u=>`${u.status} <@${u.id}> ${u.killed_by != "" ? `Killed by **${u.killed_by.capitalize()}**` : ""}`).join("\n") : 'Hmmm....'}`
	} else {
		return player.map(p => `${p.status == hidup ? hidup : mati} ${roles(p.role).emoji} ${p.status == hidup ? `<@${p.id}>` : p.name}`)
	}
}

exports.run = async function(msg, args, creator, game, client, prefix) {
  await msg.delete()
  if (!msg.guild.me.permissions.has("SEND_MESSAGES")) return msg.reply(embeds(i18n.__mf("common.command.permissions.missing",{perm:"`SEND_MESSAGES`"})));
  const cmd = args.join(" ")
  if (args.length > 0 && cmd.replace(/ +/, "").toLowerCase() === "how2play") return help(msg, args, creator, game, client, prefix);
  game.started = false;
 // collector
  var player = [];
  var messages = [];
  var content = function () {
    let p = player
	  return [{
	  color: color(),
	  title: "WEREWOLF",
	  description: `**Pemain : ${p.length}**\n${p.length > 0 ? p.map(u => `${u.status} <@${u.id}>`).join("\n") : ""}\n\n\n*Jumlah minimal 7 pemain dan maksimal 15 pemain.*`}]
  }
  var row = {
	type : 1,
    components:[
		new MessageButton()
		.setCustomId("join")
		.setLabel("Join")
		.setStyle("PRIMARY"),
		new MessageButton()
		.setCustomId("start")
		.setLabel("Mulai")
		.setStyle("DANGER"),
		new MessageButton()
		.setCustomId("cancel")
		.setLabel("Batal")
		.setStyle("DANGER")
    ]
  }
  function addplayer (id) {
    let format = {
      id: id,
	    name: msg.client.users.cache.get(id).username,
      status: hidup,
      role: "",
      killed_by: "",
      saved_by: "",
      emoji: "",
      power: 0
    }
    player.push(format)
  }
  function players (id) {
    let index = player.findIndex((obj => obj.id == id));
    return player[index]
  }
  
  const message = await msg.channel.send({
	 embeds: content(),
	 components : [row]
  })
  addplayer(creator.id)
  message.edit({embeds:content()})
  // Collector
  var max = 15
  var min = 7
  var filter = i => {
    let userid = i.user.id;
  	let id = i.customId;
  	if(id === "join") {
      if (players(userid) != undefined) return i.reply({content: `Kak udah join!`, ephemeral: true})
	    if(player.length === max) return i.reply({content: `Room udah penuh!`, ephemeral: true});
	    if (player.length < max) return userid && id;
  	} else if(id === "start") {
  		if(userid != creator.id) return i.reply({content: `Host Only!`, ephemeral: true});
  		if (player.length < min) return i.reply({content: `Kurang Pemain!`, ephemeral: true});
  		if(player.length >= min && player.length <= max) return userid && id;
  	} else if (id === "cancel") {
  		if(userid != creator.id) return i.reply({content: `Host Only!`, ephemeral: true});
  		  return userid && id;
  	}
  }
  var c = message.createMessageComponentCollector({
    filter,
    componentType: 'BUTTON',
    time : 100000
  });
  c.on("collect", async (m) => {
    const userid = m.user.id;
  	const id = m.customId;
  	if (id == "join") {
  	  addplayer(userid);
  	  m.update({embeds:content()})
  	}
  	if (id == "start" || id == "cancel") {
  	  disable(m)
  	  c.stop(id);
  	}
  })
  c.on("end", async (collected, reason) => {
    switch (reason) {
      case "start":
		    game.started = false;
        setrole(msg, player, game, creator)
        break;
      case "cancel":
        game.started = false
      case "time":
        disable()
        game.started = false;
        break;
    }
  })
  function disable(event) {
    let prog = 0
    for (let a = 0;a < row.components.length;a++) {
      prog++;
      row.components[a].setDisabled(true)
      if (prog == row.components.length) {
        if (event != undefined) {
          event.update({components: [row]})
        } else {
          message.edit({components: [row]})
        }
        break;
      }
    }
  }
}
async function setrole(msg, party, game, creator) {
  game.started = false
 // collector
  var player = party;
  var wrole;
  switch (player.length) {
    case 7:
      wrole = [
        { name: 'werewolf',value: 2 },
      	{ name: 'seer', value: 1 },
      	{ name: 'guardian', value: 1 },
      	{ name: 'villager', value: 3 }
      ]
      break;
    case 8:
      wrole = [
        { name: 'werewolf',value: 2 },
      	{ name: 'seer', value: 1 },
      	{ name: 'guardian', value: 1 },
      	{ name: 'villager', value: 4 }
      ]
      break;
    case 9:
      wrole = [
        { name: 'werewolf',value: 2 },
      	{ name: 'seer', value: 1 },
      	{ name: 'guardian', value: 1 },
      	{ name: 'villager', value: 5 }
      ]
      break;
    case 10:
      wrole = [
        { name: 'werewolf',value: 3 },
      	{ name: 'seer', value: 1 },
      	{ name: 'guardian', value: 1 },
      	{ name: 'villager', value: 5 }
      ]
      break;
    case 11:
      wrole = [
        { name: 'werewolf',value: 3 },
      	{ name: 'seer', value: 1 },
      	{ name: 'guardian', value: 1 },
      	{ name: 'hunter', value: 1 },
      	{ name: 'villager', value: 5}
      ]
      break;
    case 12:
      wrole = [
        { name: 'werewolf',value: 3 },
      	{ name: 'seer', value: 1 },
      	{ name: 'guardian', value: 1 },
      	{ name: 'hunter', value: 1 },
      	{ name: 'villager', value: 6 }
      ]
      break;
    case 13:
      wrole = [
        { name: 'werewolf',value: 4 },
      	{ name: 'seer', value: 2 },
      	{ name: 'guardian', value: 2 },
      	{ name: 'hunter', value: 1 },
      	{ name: 'villager', value: 4 }
      ]
      break;
    case 14:
      wrole = [
        { name: 'werewolf',value: 4 },
      	{ name: 'seer', value: 2 },
      	{ name: 'guardian', value: 2 },
      	{ name: 'hunter', value: 1 },
      	{ name: 'villager', value: 5 }
      ]
      break;
    case 15:
      wrole = [
        { name: 'werewolf',value: 4 },
      	{ name: 'seer', value: 2 },
      	{ name: 'guardian', value: 2 },
      	{ name: 'hunter', value: 1 },
      	{ name: 'villager', value: 6 }
      ]
      break;
  }
  roll(msg, game, creator, player, wrole, 0)
}
async function roll (msg, game, creator, p, r, i) {
    var belum,sudah,peran;
        peran = r[i]
        sudah = p.filter(p=>p.role != "")
        belum = await randomize(p.filter(p => p.role == ""))
    let antrian = 0
    for (let a=0; a < peran.value;a++) {
      antrian++;
      switch(belum[a].role) {
        case 'hunter':
          belum[a].role = peran.name;
          belum[a].emoji = roles(peran.name).emoji;
          belum[a].power = 2;
          break;
        default:
          belum[a].role = peran.name;
          belum[a].emoji = roles(peran.name).emoji;
          belum[a].power = 0;
          break;
      }
      if (antrian == peran.value) {
        if (r[(i)+1] != undefined) {
          let merged = [].concat(sudah, belum)
          return roll(msg, game, creator, merged, r, (i)+1)
        } else {
          msg.channel.send({
            embeds:[{
               color:color(),
               title: "PEMBAGIAN ROLE",
               description: `Oke i got it!\nMbak land mau kasih role minta ijin kirim DM ke kakak semua ya :)\n\nNote aku minta maaf ka, Kalo ada yg salah maapin Moderator nya noob kali ya ;(`
          }]}).then(async (m) => {
            let final = [].concat(sudah, belum)
            await clear(m, 2000)
            send(msg,final,game,creator)
          })
        }
        break;
      }
    }
}
function teman(array, self) {
  let tmn = array.filter(u=> u.id != self.id && u.role == self.role)
  if (tmn.length) {
    return `\nYeay, kakak punya temen!\n${tmn.map(u=>`${u.emoji} <@${u.id}>`).join("\n")}`
  } else {
    return '';
  }
}
async function send(msg, party, game, creator) {
  game.started = false;
  let count = 0
  let p = party;
  if (p.length > 1) {
    for(let i=0;i<p.length;i++) {
      count++;
      if (p[i].role == 'werewolf') {
        let user = msg.client.users.cache.get(p[i].id)
        await user.send(`Kamu adalah seorang ${p[i].emoji} **${p[i].role}**!${teman(p, {id:p[i].id, role:p[i].role})}`)
      } else {
        let user = msg.client.users.cache.get(p[i].id)
        await user.send(`Kamu adalah seorang ${p[i].emoji} **${p[i].role}**!`)
      }
      if (p.length == count) {
        msg.channel.send({
          embeds:[{
            color: color(),
            title: "PEMBAGIAN ROLE",
            description: `Make sure kakak udah dapet semua role nya ya :)\n..um btw mulai permainan sekarang yuk aku mau narasi tau! See ya in 2 seconds!`
        }]}).then(async (m) => {
          await clear(m, 2000)
          narasi(msg, p, game, creator, "malam", undefined)
        })
        break;
      }
    }
  } else {
    
  }
}
async function updatestatus(player, result, type, callback) {
  var count = 0
  if (type === 'vote') {
    var content;
    let suspect = [...result]
    suspect.sort((a,b) => a.vote_count < b.vote_count);
    if (suspect.filter(u=> u.vote_count === suspect[0].vote_count).length != 0) {
        content = `**Hasil Pemilihan Imbang!**\n>>> Note: Pemilihan aku ulang, tunggu ya kak.`
        return callback(player, content, "draw");
    } else {
      player[findIndex(u=>u.id)].status = mati
      player[findIndex(u=>u.id)].killed_by = "Hanged"
      content = `<@${suspect[0].id}> dia adalah ${suspect[0].emoji}**${suspect[0].role.capitalize()}**\nTotal **${suspect[0].vote_count}**\n\n**Hasil Voting**\n${suspect.map(u=>`${u.id === suspect[0].id ? `:red_circle: <@${u.id}> **${u.vote_count}**` : `:black_circle: <@${u.id}> **${u.vote_count}**` }`)}`
      return callback(player, content, "success")
    }
  } else if(type == 'pengumuman') {
    let content = []
    let copy = [...result].filter(i=>i.by_status === "berhasil")
    for (let i = 0; i < copy.length;i++) {
      count++;
      content.push(copy[i].by_info)
      switch (copy[i].by_role) {
        case 'guardian':
          player[findIndex(u=>u.id === copy[i].id)].saved_by = copy[i].by_role;
          player[findIndex(u=>u.id === copy[i].id)].saved_by = copy[i].by_role;
          break;
        case 'werewolf':
          player[findIndex(u=>u.id === copy[i].id)].status = mati;
          player[findIndex(u=>u.id === copy[i].id)].killed_by = copy[i].by_role;
          break;
        case 'hunter':
          player[findIndex(u=>u.id === copy[i].id)].status = mati;
          player[findIndex(u=>u.id === copy[i].id)].killed_by = copy[i].by_role;
          break;
      }
      if(result.length == count) {
        callback(content);
        break;
      }
    }
  }
}

async function narasi(msg, party, game, creator, days, results) {
	game.started = false
 // collector
  var day = days === "malam" ? "malam" : "s"
  var Kehidupan = party.filter(u=>u.status != mati)
  var kematian = party.filter(u=>u.status != hidup)
  var player = party;
  var werewolf = player.filter(u=> u.role== 'werewolf' && u.status != mati)
  var seer = player.filter(u=> u.role== 'seer' && u.status != mati)
  var guardian = player.filter(u=> u.role== 'guardian' && u.status != mati)
  var hunter = player.filter(u=> u.role== 'hunter' && u.power != 2 && u.status != mati)
  let queue = [].concat(werewolf,seer,guardian,hunter)
  var result = results || []
  var werewolf_kill = []
  var seer_speel = []
  var guardian_protect = []
  var hunter_shoot = []
  var selected = []
  var messages = [];
  function recursive (callback) {
    let copy = [].concat(seer_speel,guardian,werewolf_kill, hunter_shoot)
    let prog = 0;
    for (let i = 0;i<copy.length;i++) {
      prog++;
      if (copy[i].id) {
        condition(copy[i].id, copy[i].by_id)
      }
      if (prog == copy.length) {
        callback(result)
        break;
      }
    }
  }
  function condition (dia, aku) {
    let self = players(aku)
    let target = players(aku)
    if (target === undefined) {
      if (self.role === "seer") {
        result.push({id: null, role: null, by_id: self.id, by_role:  self.role, by_status: dia, by_info: `Seseorang ketiduran..`});
      } else if(self.role === "guardian") {
        result.push({id: null, role: null, by_id: self.id, by_role:  self.role, by_status: dia, by_info:`Seseorang ketiduran..`});
      } else if (self.role === "werewolf") {
        result.push({id: null, role: null, by_id: self.id, by_role:  self.role, by_status: dia, by_info: `Seseorang ketiduran..`});
      } else if (self.role === "hunter") {
        result.push({id: null, role: null, by_id: self.id, by_role:  self.role, by_status: dia, by_info: `Seseorang ketiduran..`});
      }
      // Guardian
    } else if (self.role == "guardian") {
      if (hunter_shoot.filter(u=>u.id === self.id).length != 0 && guardian_protect.filter(u=>u.id === self.id).length === 0) {
        result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_status: "gagal", by_info: `**${self.role.capitalize()}** di tembak **${hunter_shoot.find(u=>u.id===self.id).by_role.capitalize()}**`});
      } else if (self.id == target.id && werewolf_kill.filter(u=>u.id === self.id).length && guardian_protect.filter(u=>u.id === self.id).length === 0) {
        result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_status: "gagal", by_info: `**${self.role.capitalize()}** di mangsa **${werewolf_kill.find(u=>u.id===self.id).by_role.capitalize()}**`});
      } else if(target.role === "werewolf" && guardian_protect.find(u=>u.id === target.id)) {
        result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_status: "gagal", by_info: `**${self.role.capitalize()}** Berhasil melindungi seseorang..`});
      } else if(self.id != target.id && werewolf_kill.find(u=>u.id === self.id)) {
        result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_status: "gagal", by_info: `<$${self.id}> di mangsa **${werewolf_kill.find(u=>u.id===self.id).by_role.capitalize()}**`});
      } else {
        result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_status: "berhasil", by_info: `**${self.role.capitalize()}** Berhasil melindungi seseorang...`});
      }
      // werewolf
    } else if (self.role == "werewolf") {
      if (hunter_shoot.filter(u=>u.id === self.id).length != 0 && guardian_protect.filter(u=>u.id === self.id).length === 0) {
        result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_status: "gagal", by_info: `**${self.role.capitalize()}** di buru **${hunter_shoot.find(u=>u.id ==self.id).by_role.capitalize()}**`});
      } else if (guardian_protect.filter(u=>u.id === target.id).length) {
        result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_status: "gagal", by_info: `**${self.role.capitalize()}** gagal memangsa target...`});
      } else {
        result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_status: "berhasil", by_info: `**${self.role.capitalize()}** Berhasil memangsa **${target.role.capitalize()}**`});
      }
      // Hunter
    } else if (self.role == "hunter") {
      if(self.power != 0) {
        let power = (self.power)-1
        player[findIndex(self.id)].power = (parseInt(self.power))-1
        if (werewolf_kill.filter(u=>u.id === self.id).length != 0 && guardian_protect.filter(u=>u.id === self.id).length === 0) {
          result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_info: 'gagal', by_info: `**${self.role.capitalize()}** di mangsa**${werewolf_kill.find(u=>u.id === self.id).by_role.capitalize()}**`})
        } else if (target.role === 'guardian' && guardian_protect.find(u=>u.id === target.id)) {
          result.push({id: target.id, role: target.role, by_id: self.id, by: self.role, by_status:"gagal", by_info: `**${self.role.capitalize()}** peluru meleset...`})
        } else if (target.role == 'villager' && guardian_protect.find(u=>u.id === target.id)) {
          result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_status:"gagal", by_info: `**${self.role.capitalize()}** salah sasaran...`})
        } else if (target.role === "werewolf") {
          if (guardian_protect.find(u=>u.id=== target.id)) {
            result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_info: 'gagal', by_info: `**${self.role.capitalize()}** gagal saat berburu...`})
          } else {
            result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_info: 'berhasil', by_info: `**${self.role.capitalize()}** menembak mati **${target.role.capitalize()}**`})
          }
        }
      }
        // Seer
    } else if (self.role === "seer") {
      if (werewolf_kill.filter(u=>u.id === self.id).length) {
        result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_info: 'gagal', by_info: `**${self.role.capitalize()}** di mangsa **${werewolf_kill.find(u=>u.id === self.id).by_role.capitalize()}**`})
      } else if (target.role === "werewolf") {
        result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_info: 'berhasil', by_info: `**${self.role.capitalize()}** membuka identitas **${target.role.capitalize()}**`})
      } else if(target.role === "villager"){
        result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_info: 'gagal', by_info: `**${self.role.capitalize()}** bingung saat meramal...`})
      } else if (target.role === "guadian") {
        result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_info: 'gagal', by_info: `**${self.role.capitalize()}** masih belum melihat target...`})
      } else if (target.role === "hunter") {
        result.push({id: target.id, role: target.role, by_id: self.id, by_role: self.role, by_info: 'gagal', by_info: `**${self.role.capitalize()}** belum menemukan target...`})
      }
    }
  }
  function addresult (dia, aku) {
    var self = players(aku)
    if (self.role === 'seer') {
      seer_speel.push({id: dia, by_id:self.id, by_role:self.role})
    } else if (self.role === 'guardian') {
      guardian_protect.push({id: dia, by_id:self.id,by_role:self.role})
    } else if (self.role === 'werewolf') {
      werewolf_kill.push({id: dia, by_id:self.id, by_role:self.role})
    } else if (self.role === 'hunter') {
      hunter_shoot.push({id: dia, by_id:self.id, by_role:self.role})
    }
  }
  function players (id) {
    let index = player.findIndex(u=> u.id === id)
    return player[index]
  }
  function embedContent(action, role) {
    if(action === 'malam') return `Sekarang malam hari, semua orang menutup mata dan menyenandungkan lagu pengantar tidur untuk dirimu sendiri sampai pagi....💤...💤.....💤`;
    if(action === 'pagi') return `Sekarang pagi hari, semua orang membuka mata dan bersiap untuk mendengarkan kabar hari ini....☀...☀.....☀`;
    //werewolf
    if(action === 'werewolf_kill') return `Werewolf, buka matamu dan pilih korban untuk pesta malam ini.`;
    if(action === "werewolf_kill_someone") return `Roger That!!`;
    //guardian
    if(action === 'guardian_lindungi') return `Guardian, buka matamu dan pilih seseorang yang ingin kamu lindungi.`;
    if (action === "guardian_lindungi_werewolf") return `Badside! kakak melindungi seorang **werewolf**!`;
    if (action === "guardian_lindungi_seer") return `Goodside! Kakak melindungi seorang **seer**!`
    if (action === "guardian_lindungi_hunter") return `Goodside! Kakak melindungi seorang **hunter**!`;
    if (action === "guardian_lindungi_guardian") return `Goodside! Kakak melindungi seorang **guardian**!`;
    if (action === "guardian_lindungi_villager") return `Goodside! Kakak melindungi seorang **villager**!`;
    //seer
    if(action === 'seer_terawang') return `Seer, buka matamu dan tunjuk orang yang jiwanya ingin kamu lihat.`;
    if (action === "seer_tunjuk_werewolf") return `Badside! kakak menunjuk seorang **werewolf**!`;
    if (action === "seer_tunjuk_seer") return `Goodside! Kakak menunjuk seorang **seer**!`
    if (action === "seer_tunjuk_guardian") return `Goodside! Kakak menunjuk seorang **guardian**!`
    if (action === "seer_tunjuk_hunter") return `Goodside! Kakak menunjuk seorang **hunter**!`;
    if (action === "seer_tunjuk_villager") return `Goodside! Kakak menunjuk seorang **villager**!`;
    //hunter
    if(action === 'hunter_dor') return `Hunter, buka matamu dan pilih korban untuk di tembak.`;
    if (action === "hunter_dor_werewolf") return `Sisa peluru ${(role.power)-1}`;
    if (action === "hunter_dor_seer") return `Sisa peluru ${(role.power)-1}`
    if (action === "hunter_dor_guardian") return `Sisa peluru ${(role.power)-1}`
    if (action === "hunter_dor_hunter") return `Sisa peluru ${(role.power)-1}`;
    if (action === "hunter_dor_villager") return `Sisa peluru ${(role.power)-1}`;
  }
  function bad_or_good(aku, dia) {
    const me = player.find(u=>u.id === aku)
    const target = player.find(u=>u.id === dia)
    if (me.role == 'werewolf') return embedContent("werewolf_kill_someone");
    if(me.role === "guardian") return embedContent(me.role+'_lindungi_'+target.role);
    if(me.role === "seer") return embedContent(me.role+'_terawang_'+target.role);
    if(me.role === "hunter") return embedContent(me.role+'_dor_'+target.role);
  }
  msg.channel.send({
  	embeds: [{
  	  color:color(),
  	  title: day.capitalize(),
  		description: embedContent(day)
  	 }]
  }).then(async m => {
    if (day === "malam") {
      selectplayer(queue[0].id, queue[0].role, 0)
    } else if (day === "pagi"){
      var content = `Pada malam hari...\n`
      updatestatus(player, result, "pengumuman", async (res) => {
        let info = res;
        const ms = await m.channel.send({
          embeds: [{
            color: color(),
            title: day.capitalize(),
            description: content
          }]
        })
        if (info.length) {
          let counter = 0
          var interval = setInterval(async () => {
            if (counter > info.length) {
              clearInterval(interval)
              content = [content,playerlist(player)].join("\n")
              ms.edit({
                embeds: [{
                  color: color(),
                  title: day.capitalize(),
                  description: content
                }]
              }).then(async i =>{
                await i.channel.send({
                  embeds:[{
                    color: color(),
                    title: "WAKTU DISKUSI",
                    diskusi: "Berdiskusi dengan pemain lain tentang kejadian semalam!\n\n*waktu diskusi ⏰ 60 detik*"
                  }]
                })
                setTimeout(async () => {
                  let c = [...player]
                  let count = 0
                  for(let a=0;a<cpy.length;a++) {
                    count++;
                    if(cpy[a].saved_by != '') {
                      cpy[a].saved_by = ''
                    }
                    if (count === cpy.length) {
                      voting(msg, cpy, game,creator)
                      break;
                    }
                  }
                }, 60000);
              })
            } else {
              content = [content,info[counter]].join("\n")
              counter++;
              await ms.edit({
                embeds: [{
                  color: color(),
                  title: day.capitalize(),
                  description: content
                }]
              })
            }
          }, 1300)
        } else {
          content = [content,"**Gak ada apapa semalem :(**"].join("\n")
          await ms.edit({
            embeds: [{
              color: color(),
              title: day.capitalize(),
              description: content
            }]
          })
        }
      })
    }
  })
  let current_turn = null
  function selectplayer (id, role, index) {
    var handler = `${role}_${id}`
    var action = role == "werewolf" ? role+"_kill" : role == "seer" ? role+"_terawang" : role === "guardian" ? role+"_lindungi !" : role+"_dor"
    if (index === 0 || role != current_turn) {
      current_turn = role
      msg.channel.send({embeds: [{
    	  color:color(),
    	  title: day.capitalize(),
    		description: embedContent(action)
    	 }]}).then(m => messages.push(m.id))
    } else {
      getmsg(msg, messages[0]).then(ms => {
        ms.edit({embeds: [{
    	  color:color(),
    	  title: day.capitalize(),
    		description: embedContent(action)
    	 }]})
      })
    }
    var copy = [...player].filter(u=>u.id != id && u.status != mati).map(u => {
      return {
        label: u.name,
        value: u.id,
        emoji: "🟢",
        description: role == "werewolf" ? "Sikat !" : role == "seer" ? "Terawang !" : role === "guardian" ? "Lindungi !" : "Tembak !",
      }
    })
    copy.push({
      label: "SKIP",
      value: "skip",
      emoji: "⏭️",
      description: "Skip untuk memilih!",
    })
    var menu = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
        .setCustomId(handler)
        .setPlaceholder(`Pilih Target`)
        .addOptions(copy)
      );
    msg.client.users.cache.get(id).send({
    	embeds: [{
    	  color:color(),
    	  title: role.capitalize(),
    		description: embedContent(role)
    	 }],
    	 components : [menu]
    }).then(async m => {
      const filter = i => {
      	return i.user.id === id && i.customId
      };
      const c = m.createMessageComponentCollector({ 
        filter, 
        componentType: 'SELECT_MENU', 
        time: 60000
      })
      c.on("collect", async (i) => {
        if (i.values[0] === "skip") {
          addresult("skip", id)
          await i.reply({ content: `Oke kak..`, ephemeral: true })
        } else {
          addresult(i.values[0], id)
          await i.reply({ content: bad_or_good(id, i.values[0]), ephemeral: true })
        }
        c.stop("selected")
      })
      c.on("end", async (collected, reason) => {
        let num = (index)+1;
        let next = queue[num]
        menu.components[0].setDisabled(true);
        await m.edit({components : [menu]})
        switch (reason) {
          case 'time':
            addresult('gagal', id)
            if(next != undefined) {
              selectplayer(next.id, next.role, num)
            } else {
              recursive(function(arr) {
                narasi(msg, party, game, creator, 'pagi', arr)
              })
            }
            break;
          case 'selected':
            if(next != undefined) {
              selectplayer(next.id, next.role, num)
            } else {
              recursive(function(arr) {
                narasi(msg, party, game, creator, 'pagi', arr)
              })
            }
            break;
        }
      })
    })
  }
}
/* Penentuan Pemenang ronde
* GOODSIDE VILLAGER, SEER, GUARDIAN, HUNTER
* BADSIDE WEREWOLF, LYCAN, etc..
*/
async function checkwin(player) {
  let bad = player.filter(u=>u.role ==="werewolf" && u.status != mati)
  let good = player.filter(u=>u.role !="werewolf" && u.status != mati)
  let goodside = good.length
  let badside = bad.length
  if (badside === 0 && goodside >= 2) {
    return "goodside";
  } else if (badside == 1 && goodside == 2) {
    return "badside"
  } else if(goodside == 2 && badside != 0) {
    return "badside"
  } else if (goodside < badside) {
    return "badside"
  } else {
    return;
  }
}
/* 
* VOTING ROUND 
*/
async function voting(msg, party, game, creator) {
  game.started = false
  var player = [...party]
  var alive = player.filter(u=>u.status === hidup)
  var death = player.filter(u=>u.status === mati)
  var uservote = []
  var candidate = []
  var button = []
  function votelist() {
    return candidate.map(u=>`${u.number_name} : <@${u.id}> [${u.vote_count}]`).join("\n")
  }
  
  function chunk(obj, i) {
    let chunks = [];
    while(obj.length){
      chunks.push({
        type: 1,
       components: [obj.splice(0, i)]
      });
    }
    return chunks;
  }
  for (let i=0;i< alive.length;i++) {
	  candidate.push({
	    id: alive[i].id,
	    number_id: emo(i).id,
	    number_name: emo(i).name,
	    role: alive[i].role,
	    emoji: alive[i].emoji,
	    vote_count:0
	  })
	  button.push(new MessageButton()
	  .setCustomId(emo(i).id.toString())
	  .setEmoji(emo(i).id)
	  .setStyle("PRIMARY"))
	  if(candidate.length === alive.length && button.length === alive.length) {
	    button = chunk(button, 5)
	    vote_start()
	    break;
	  }
	}
	function vote_notice() {
	    return [{
        color: color(),
        title: "ELIMINASI",
        description: `Pilih pemain untuk di eliminasi hari ini.\n${votelist()}`
      }]
	}
	function vote_start() {
    msg.channel.send({
      embeds: vote_notice(),
      components: button
    }).then(async (ms) => {
      var done = ''
      var disable = function () {
        let prog = 0
        for(let a in button) {
          let btn = button[a].components
          for(let i=0;i < btn.length;i++) {
            prog++;
            btn.components[i].setDisabled(true);
            if (prog === candidate.length) {
              ms.edit({components: button})
              break;
            }
          }
        }
      }
      const filter = (i) => {
        if (player.filter(user=> user.id === i.user.id).length == 0) return msg.reply({content: "**Kak, gak di ajak!**", ephemeral: true});
        if (uservote.includes(i.user.id)) return i.reply({content:"**Kak, gak bisa vote lagi!**", ephemeral:true});
        if(candidate.find(u=>u.number_id === parseInt(i.customId))) return i.reply({content: "**Kak, gak bisa vote diri sendiri!**", ephemeral:true});
        return i.user.id && i.customId;
      }
      const collect = ms.createMessageComponentCollector({
        filter,
        componentType: 'BUTTON',
        time: 30000
      })
      
      collect.on("collect", async (i)=> {
        uservote.push(i.user.id)
        let index = candidate.findIndex(u=>u.number_id === i.customId)
        candidate[index].count = (candidate[index].count)+1
        await i.update({embeds:vote_notice()})
      })
      collect.on('end', async (collected, reason)=> {
        disable()
        var copy = [].concat(alive,dead)
        updatestatus(copy, candidate, "vote", async (arr, content, status)=>{
          if (status == "success") {
            msg.channel.send({embeds:[{
              color: color(),
              title: "Pengumuman",
              description: content
            }]}).then(async m => {
              switch (checkwin(arr)) {
                case 'goodside':
                  resetPlayer(msg, "goodside", arr, game, creator)
                  break;
                case 'badside':
                  resetPlayer(msg, "badside", arr, game, creator)
                  break;
                default:
                  msg.channel.send({embeds:[{
                    color: color(),
                    title: "Sore",
                    description: "**Sekarang sore hari, warga kembali ke rumah masing-masing..\nsementara itu *werewolf* sedang melancarkan strategi untuk malam berikut nya...*(to be continued)***"
                  }]}).then(async m=> {
                    setTimeout(function() {
                      narasi(msg, arr, game, creator, "malam", undefined)
                    }, 5000);
                  })
                  break;
              }
            })
          } else if(status === "draw") {
            msg.channel.send({
              embeds:[{
                color: color(),
                title: "TIE",
                description: content
              }]
            }).then(async m=> {
              setTimeout(function() {
                voting(msg, party, game, creator)
              }, 5000);
            })
          }
        })
      })
    })
	}
}
async function resetPlayer(msg, status, player, game, creator) {
  var new_player = [...player]
  var count = 0
  for(let i = 0; i < new_player.length;i++) {
    count++;
    new_player[i].status = hidup
    new_player[i].killed_by = ''
    new_player[i].saved_by = ''
    new_player[i].role = ''
    if (count === new_player.length) {
      restartGame(msg, status, player, new_player, game, creator)
      break;
    }
  }
}
async function restartGame(msg, status, old_player, new_player, game, creator) {
  var embed = () => {
    if (status === "goodside") {
      return [{
        color: color(),
        title: "WINNER",
        description: `Goodside wins! Yeay.....Congrats kak.\n${playerlist(old_player, "tamat")}`
      }]
    } else {
      return [{
        color: color(),
        title: "GAME OVER",
        description: `Badside wins! WoHoo..\n${playerlist(old_player, "tamat")}`
      }]
    }
  }
  msg.channel.send({
    embeds: embed(),
    components: [btn]
  }).then(async m => {
    let filter = i => {
      i.deferUpdate()
      return i.user.id === creator.id && i.customId;
    }
    m.awaitMessageComponent({ 
      filter, 
      componentType: "BUTTON", 
      time: 60000 
    }).then(async i => {
      btn.components[0].setDisabled(true)
      await i.update({components: [btn]})
      setrole(msg, new_player, game, creator)
    }).catch(err => {
      btn.components[0].setDisabled(true)
      c.edit({components:[btn]})
    });
  })
}
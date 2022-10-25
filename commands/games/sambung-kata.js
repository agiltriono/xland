const fs = require("fs");
const path = require("path");
const i18n = require(".././../util/i18n");
const { database, TIMER_GIF, getmsg, clear, embeds, remove } = require(".././../util/util");
const db = database.ref("guild");
const shuffle = require(".././../util/shuffle-array");

module.exports.help = {
  name: "sk",
  aliases: ["sambungkata"],
  cooldown: 10,
  category: "Games",
  multiplayer: true,
  usage: "",
  permissions: ["SEND_MESSAGES"],
  description: "games.sk.description"
}

exports.run = async function(msg, args, creator, client) {
  if (!msg.guild.me.permissions.has("SEND_MESSAGES")) return msg.reply(i18n.__mf("common.command.permissions.missing",{perm:"`SEND_MESSAGES`"}));
  
 // collector
  var player = [];
  var botplayer = [];
  var messages = [];
  var isBot = false;
  var embedContent = i18n.__("games.lobby.usage");
  
  function update(messageId) {
    if(typeof messageId != "undefined") {
      var AI;
      if (botplayer.length > 0) {
         AI = i18n.__mf("games.lobby.joined",{playerid:botplayer[0].id, labels: botplayer[0].label })+'\n';
       }
        let human = player.map(obj => i18n.__mf("games.lobby.joined", {playerid: obj.id, labels: obj.label })).join("\n");
        let joined = AI == undefined ? human : AI + human ;
        
        getmsg(msg, messageId).then(msg => {
          msg.edit(embeds(i18n.__mf("games.lobby.players", {content:embedContent, players:joined})))
        })
    } else {
      throw Error("Error updating object")
    }
  }
  function addplayer (id, invites, human) {
    let label = invites === 'join' ? 'joined' : invites === 'host' ? 'host' : 'added';
    let format = {
      id : id,
      status : '',
      score: 0,
      strike : 0,
      label: label
    }
    if (human == true) {
      player.push(format)
    } else {
      botplayer.push(format)
    }
    update(messages[0])
  }
  function players (id) {
    let index = player.findIndex((obj => obj.id == id));
    return player[index]
  }
  msg.channel.send(embeds(embedContent)).then(msg => {
    messages.push(msg.id)
    addplayer(creator.id, 'host', true)
  })
  
  // Collector
  var filter = m => m.content && m.author;
  var collector = msg.channel.createMessageCollector(filter, { time : 20000 });
  
  collector.on("collect", m => {
    const author = m.author;
    const content = m.content;
    if (content.toLowerCase().startsWith("add")) {
      if (!player.some(obj => obj.id == m.author.id)) return m.reply(i18n.__("games.notjoin"));
      const regex = /^<@!?[0-9]*>$/gm;
      const tag = content.toLowerCase().slice("add").trim().split(/ +/g);
        if (tag[1] == undefined) {
          m.reply(i18n.__("common.command.invalid"))
        } else {
          if (!regex.test(tag[1])) {
            if (tag[1].toLowerCase() === "bot") {
              if (!player.some(obj => obj.id == m.author.id)) return m.reply(i18n.__("games.notjoin"));
              isBot = true;
              addplayer(msg.client.user.id, "add", false);
            } else {
              m.reply(i18n.__("common.command.invalid"))
            }
          } else {
            const userid = tag[1].replace(/[\\<>@#&!]/g, "");
            if (players(userid) === undefined) {
              if (userid != msg.client.user.id && !m.mentions.members.first().user.bot) {
                addplayer(userid, "add", true)
              }
            } else {
              m.reply(i18n.__mf("games.lobby.alreadyjoin",{playerid: userid}))
            }
          }
        }
      } else if (content.toLowerCase() == "join") {
        if (players(author.id) == undefined) {
          addplayer(author.id, "join", true)
        } else {
          m.reply(i18n.__mf("games.lobby.alreadyjoin",{ playerid: author.id }))
        }
      } else if (content.toLowerCase() == "start") {
        if (!player.some(obj => obj.id == m.author.id)) return m.reply(i18n.__("games.notjoin"));
        if ((isBot && player.length >= 1) || (!isBot && player.length >= 2)) {
          collector.stop("start")
        } else {
          m.reply(i18n.__("games.lobby.noenoughplayer")).then(msg => {
            clear(msg, 2000)
          })
        }
      } else if (content.toLowerCase() == "exit") {
        if (!player.some(obj => obj.id == m.author.id)) return m.reply(i18n.__("games.notjoin"));
          collector.stop("exit")
    }
  })
  collector.on("end", (collected, reason) => {
    switch (reason) {
      case "start":
        remove(msg,messages[0])
        play(msg, player, "id", isBot, botplayer, client)
		
        break;
      case "exit":
        
        remove(msg,messages[0])
        msg.channel.send(embeds(i18n.__("games.lobby.exit"))).then(msg => {
          clear(msg,5000)
        })
        break;
      case "time":
        
        remove(msg,messages[0])
        msg.channel.send(embeds(i18n.__("common.commandTimeout"))).then(msg => {
          clear(msg, 5000)
        })
        break;
      default:
    }
  })
}

async function play(msg, participant, language, isBot, botlayer, client) {
  var filepath = path.join(__dirname, '..', '.', '..', 'src', 'assets', 'json', 'sk', 'bot.json')
  var json = JSON.parse(fs.readFileSync(filepath));
  var player = participant;
  var botplayer = botlayer;
  var item = [];
  var source = [];
  var rounds = [];
  var gotanswer = [];
  var messages = [];
  var gameActive = false;
  
  start(1)
  
  function sortdata() {
    source = []
    if (isBot == true) {
       for(let a in player) {
         source.push(player[a])
       }
       for(let b in botplayer) {
         source.push(botplayer[b])
       }
      source.sort(function(a,b){return a.score - b.score});
      source.reverse();
    } else {
       for(let a in player) {
         source.push(player[a])
       }
      source.sort(function(a,b){return a.score - b.score});
      source.reverse();
    }
  }
  
  function remain () {
    let temp = []
    let sts = []
    if (isBot == true) {
      temp.push(botplayer[0])
      for(let i = 0; i < player.length; i++) {
        temp.push(player[i])
      }
      for(let i = 0; i < temp.length; i++) {
        if (temp[i].status.toString() === "") {
          sts.push(player[i])
        }
      }
    } else {
      for(let i = 0; i < player.length; i++) {
        if (player[i].status.toString() === "") {
          sts.push(player[i])
        }
      }
    }
    return sts.length
  }
  function players(object) {
    return player[player.findIndex((obj => obj.id == object ))]
  }
  function points(point) {
    let table = [10,5,15,20]
    return (point)+shuffle.pick(table, { 'picks' : 1 })
  }
  function score(ids) {
    if (ids == msg.client.user.id) {
      let data = botplayer.findIndex((obj => obj.id == ids ));
      botplayer[data].score = points(botplayer[data].score);
    } else {
      players(ids).score = points(players(ids).score);
    }
  };
  
  function failed(ids) {
    if (ids == msg.client.user.id) {
      return false
    } else {
      if (players(ids).strike === 3) {
        return true
      } else {
        return false
      }
    }
  };
  function strike(ids) {
    if (players(ids).strike != 3) {
      players(ids).strike = (players(ids).strike)+1;
    }
    if (players(ids).strike === 3) {
      players(ids).status = ":skull_crossbones:";
    }
  };
  function getdata(object) {
    if (typeof object == "undefined") {
      sortdata()
      return source.map(obj => obj.status + " <@" + obj.id + "> " + obj.score).join("\n")
    } else {
      return object.map(obj => obj.status + " <@" + obj.id + "> " + obj.score).join("\n")
    }
  }
  function playable() {
	sortdata ()
	let played = source.filter(obj => obj.status != ":skull_crossbones:");
	let lose = source.filter(obj => obj.status === ":skull_crossbones:");
	if (lose.length === 0) {
	  return played.map(obj => obj.status + " <@" + obj.id + "> " + obj.score).join("\n")
	} else {
	  return `${played.map(obj => obj.status + " <@" + obj.id + "> " + obj.score).join("\n")}\n\n${lose.map(obj => obj.status + " <@" + obj.id + "> " + obj.score).join("\n")}`
	}
  }
  function getwinner() {
    let win = [];
    let lose = []
    if (isBot == true) {
      for(let a in player) {
         win.push(player[a])
         lose.push(player[a])
      }
      for(let b in botplayer) {
         win.push(botplayer[b])
         lose.push(botplayer[b])
      }
    } else {
      for(let a in player) {
        win.push(player[a])
        lose.push(player[a])
      }
    }
    win.sort(function(a,b){return a.score - b.score});
    win.splice(0, (win.length) -1)
    lose.sort(function(a,b){return a.score - b.score});
    lose.reverse();
    lose.splice(0, 1)
    for(let i = 0; i < lose.length; i ++) {
        if (lose[i].status === "") {
          lose[i].status = ":skull_crossbones:"
        }
      }
    if (win[0].status.toString() === ":skull_crossbones:" || win[0].status.toString() === "") {
      win[0].status = ":tada:"
    }
    return {
      win:win,
      lose:lose
    }
  }
  function start(round, query) {
    var items = query != undefined ? json.find(o=>o.kata === query) : shuffle.pick(json, { 'picks' : 1 });
	item = []
	rounds = []
	rounds.push(round)
	item.push(items)
    display(rounds[0])
  }
  function roll () {
    gameActive = false;
    if (remain() >= 2) {
      remove(msg, messages[0])
      start(rounds[0])
      collector.resetTimer()
    } else {
      collector.stop("round")
    }
  }
  function restart(author, query) {
    gameActive = false;
    score(author.id)
    if (remain() >= 2) {
      remove(msg, messages[0])
      start((rounds[0])+1, query)
      collector.resetTimer()
    } else {
      collector.stop("round")
    }
  }
  function getResult(content) {
	if (json.find(o => o.kata == content) && content != item[0].kata && content.startsWith(awalan())) {
		return content;
	} else {
		return 0;
	}
  }
  function awalan () {
	let word = item[0].lema.includes(".") ? item[0].lema.split(".") : item[0].kata;
	return Array.isArray(word) ? word[word.length -1] : word;
  }
  function botWord(awal) {
	let wordlist = json.filter(o =>  o.kata != item[0].kata && o.kata.toString().startsWith(awal));
	if (wordlist.length != 0) {
		let result = shuffle.pick(wordlist, {"picks" : 1 })
		return result.kata
	} else {
		return 0;
	}
  }
  function display(rounds) {
    gameActive = true;
    msg.channel.send(embeds(i18n.__mf("games.sk.command.ingame.question",{
        content: `\`${item[0].lema.includes(".") ? item[0].lema.toUpperCase() : item[0].kata}\`\n${item[0].arti}`,
		awalan: awalan(),
        players: playable()
      }), { 
        text: `${i18n.__mf("games.sk.command.ingame.rounds",{ round: rounds })}`,
        url : TIMER_GIF
    })).then(msg => {
      messages = []
      messages.push(msg.id)
      if (isBot == true) {
		let word = botWord(awalan());
		if (word != 0) {
          msg.channel.sendTyping()
          setTimeout(() => {
            msg.channel.send(word)
          }, 6000);
		}
      }
    })
  }
  var interval = setInterval(() => {
    if (remain() < 2) {
      clearInterval(interval)
      collector.stop('round')
    }
  }, 1500)
  function filter(m) {
    let uid = player.some(obj => obj.id === m.author.id);
    let uuid = botplayer.some(obj => obj.id === m.author.id);
    let answer = getResult(m.content.toLowerCase());
    if (uuid && answer != 0) {
      return m.content.toLowerCase() && m.author.id
    } else  {
      return m.content.toLowerCase() && uid
    }
  }
  
  const collector = msg.channel.createMessageCollector({
    filter,
    time : 20000
  });
  
  collector.on("collect", m => {
    let content = m.content.toLowerCase();
    let author = m.author;
    if (!gameActive) return;
    if (remain() <= 1) {
      collector.stop("round")
    }
	if (getResult(content) != 0) {
		// default = true 
      if(failed(author.id) === false) {
        /*m.reply(i18n.__("games.sk.command.ingame.alreadydead"))
      } else {*/
        restart(author, content)
        collector.resetTimer()
      }
    } else {
	  if (content === "roll") {
		roll()
	  } else {
		  // default = true 
        if(failed(author.id) === false) {
          /*m.reply(i18n.__("games.sk.command.ingame.alreadydead"))
        } else {*/
          strike(author.id)
        }
	  }
    }
  })
  
  collector.on("end", (collected, reason) => {
    
    switch (reason) {
      case 'time':
      case 'round':
        remove(msg, messages[0])
        let result = getwinner();
        msg.channel.send(embeds(i18n.__mf("games.sk.command.ingame.gameover",{
          win:getdata(result.win),
          lose:getdata(result.lose)
        }))).then(msg => {
          clear(msg, 5000)
        })
        break;
    }
  })
}
const fs = require("fs");
const path = require("path");
const i18n = require(".././../util/i18n");
const { database, TIMER_GIF, getmsg, clear, embeds, remove, } = require(".././../util/util")
const shuffle = require(".././../util/shuffle-array");
const db = database.ref("guild")

module.exports.help = {
  name: "abc",
  aliases: ["abc"],
  cooldown: 3,
  category: "Games",
  multiplayer: true,
  usage: "",
  permissions: ["SEND_MESSAGES"],
  description: "games.abc.description"
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
      score : 0,
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
        go(msg, player, isBot, botplayer, client)
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
function go(msg, player, isBot, botlayer, client) {
  var firstmsg = []
  
  function getlang(relativeName) {
    try {
      const folderPath = path.join(process.cwd(), ...relativeName.split("/"));
      return fs
        .readdirSync(folderPath,{ withFileTypes: true })
        .filter((dirent) => dirent.isFile())
        .map((dirent) => dirent.name.split(".")[0]);
    } catch (err) {
      console.log(err)
    }
  }
  var getlg = getlang("./src/assets/json/abc");
  var getls = `🌐 \`${getlg.toString().replace(/,/g, "\n\`🌐\` ")}\``;
  var firstcontent = i18n.__("games.locale.language");
  
  
  msg.channel.send(embeds(firstcontent + getls)).then(msg => {
    firstmsg.push(msg.id)
  })
  
  function filter(m) {
    let uid =  player.some(obj => obj.id == m.author.id)
    return m.content.toLowerCase() && uid;
  }
    
  var collector = msg.channel.createMessageCollector({filter, time : 30000 });
    
  collector.on("collect", m => {
    let content = m.content.toLowerCase();
    let channel = m.channel;
    let author = m.author;
    let valid = getlg.some(obj => obj.toLowerCase() === content);
      
    if (valid) {
      collector.stop(content)
    } else {
      let field = i18n.__mf("games.locale.notlanguage",{playerid:author.id});
      channel.send(embeds(field)).then(msg => {
        clear(msg,2000)
      })
    }
  })
  collector.on("end", (collected, reason) => {
    if (reason && getlg.some(obj => obj.toLowerCase() == reason)) {
      let field = i18n.__mf("games.locale.playerchoosed",{text:reason, playerid:collected.first().author.id});
      msg.channel.send(embeds(field)).then(ms => {
        msg.channel.messages.fetch(firstmsg[0]).then(msg => {
          clear(msg)
        })
        clear(ms,2000).then(() => {
          play(msg, player, reason, isBot, botlayer, client)
        })
      })
    } else if (reason === "time") {
      
      msg.channel.send(embeds(i18n.__("common.commandTimeout"))).then(msg => {
        clear(msg,5000)
      })
    }
  })
}
function play(msg, participant, language, isBot, botlayer, client) {
  var json = require(`.././../src/assets/json/abc/${language}.json`);
  var item = []
  var player = participant;
  var botplayer = botlayer;
  var source = [];
  var gotanswer = [];
  var messages = [];
  var maxrounds = 10;
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
  function start(round) {
    item = []
    rounds = []
    item.push(shuffle.pick(json,{
      'picks' : 1
    }))
    rounds.push(round)
    display(rounds[0])
  }
  function restart(author) {
    gameActive = false;
    score(author.id)
    if (rounds < maxrounds && remain() >= 2) {
      remove(msg, messages[0])
      start((rounds[0])+1)
      collector.resetTimer()
    } else {
      collector.stop("round")
    }
  }
  function display(rounds) {
    gameActive = true;
    msg.channel.send(embeds(i18n.__mf("games.abc.command.ingame.question",{
        content: `\`${item[0].question.charAt(0).toUpperCase() + item[0].question.slice(1)}\nA. ${item[0].A}\nB. ${item[0].B}\nC. ${item[0].C}\nD. ${item[0].D}\``,
        players: getdata()
      }), { 
        text: i18n.__mf("games.abc.command.ingame.rounds",{
        round:rounds,
        maxround:maxrounds
      }),
        url : TIMER_GIF
    })).then(msg => {
      messages = []
      messages.push(msg.id)
      if (isBot == true) {
        let posible = shuffle.pick([1, 2], { 'picks' : 1 });
        if (posible == 1) {
          msg.channel.sendTyping()
          setTimeout(() => {
            msg.channel.send(item[0].answer.toUpperCase())
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
  },1500)
  function filter(m) {
    let uid = player.some(obj => obj.id === m.author.id);
    let uuid = botplayer.some(obj => obj.id === m.author.id);
    if (uuid && item[0].answer.toUpperCase() === m.content.toUpperCase()) {
      return m.content.toUpperCase() && m.author.id
    } else {
      return m.content.toUpperCase() && uid
    }
  }
  
  const collector = msg.channel.createMessageCollector({
    filter,
    time : 20000
  });
  
  collector.on("collect", m => {
    let author = m.author;
    if (!gameActive) return;
    if (remain() <= 1) {
      collector.stop("round")
    }
    if (item[0].answer.toUpperCase() == m.content.toUpperCase()) {
      if(failed(author.id) === true) {
        m.reply(i18n.__("games.abc.command.ingame.alreadydead"))
      } else {
        restart(author)
        collector.resetTimer()
      }
    } else {
      if(failed(author.id) === true) {
        m.reply(i18n.__("games.abc.command.ingame.alreadydead"))
      } else {
        strike(author.id)
        m.reply(i18n.__mf("games.abc.command.ingame.wronganswer",{
          strikes:players(author.id).strike
        }))
      }
    }
  })
  
  collector.on("end", (collected, reason) => {
    
    switch (reason) {
      case 'time':
      case 'round':
        remove(msg, messages[0])
        let result = getwinner();
        msg.channel.send(embeds(i18n.__mf("games.abc.command.ingame.gameover",{
          win:getdata(result.win),
          lose:getdata(result.lose)
        }))).then(msg => {
          clear(msg,5000)
        })
        break;
    }
  })
}
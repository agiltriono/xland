const { database, TIMER_GIF, getmsg, remove, clear, embeds, games } = require(".././../util/util");
const db = database.ref("guild");
const shuffle = require(".././../util/shuffle-array");
const i18n = require(".././../util/i18n");
const fs = require("fs");
const path = require("path");

module.exports.help = {
  name: "hangman",
  aliases: ["hang-man","hang","isikata","isi-kata"],
  cooldown: 3,
  category: "Games",
  multiplayer: true,
  usage: "",
  permissions: ["SEND_MESSAGES"],
  description: "games.hangman.description"
}

exports.run = async function(msg, args, creator, game, client) {
  if (!msg.guild.me.permissions.has("SEND_MESSAGES")) return msg.reply(i18n.__mf("common.command.permissions.missing",{perm:"`SEND_MESSAGES`"}));
  game.started = true;
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
      strike : 6,
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
        go(msg, player, isBot, botplayer, game, client)
        break;
      case "exit":
        game.started = false;
        remove(msg,messages[0])
        msg.channel.send(embeds(i18n.__("games.lobby.exit"))).then(msg => {
          clear(msg,5000)
        })
        break;
      case "time":
        game.started = false;
        remove(msg,messages[0])
        msg.channel.send(embeds(i18n.__("common.commandTimeout"))).then(msg => {
          clear(msg, 5000)
        })
        break;
      default:
    }
  })
}
function go(msg, player, isBot, botlayer, game, client) {
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
  var getlg = getlang("./src/assets/json/hangman");
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
          play(msg, player, reason, isBot, botlayer, game, client)
        })
      })
    } else if (reason === "time") {
      game.started = false;
      msg.channel.send(embeds(i18n.__("common.commandTimeout"))).then(msg => {
        clear(msg,5000)
      })
    }
  })
}
function play(msg, participant, language, isBot, botlayer, game, client) {
  var messages = [];
	var rounds = 1;
	var text = '';
  var word = '';
  var clue = '';
  var point = 0;
	var player = participant;
	var botplayer = botlayer;
	var maxrounds = 10;
	var gameActive = false;
  var json = require(`.././../src/assets/json/hangman/${language}.json`);
  var hangman = [
  ` 
    +---+
    |   |
        |
        |
        |
        |
  =========`,
  ` 
    +---+
    |   |
    O   |
        |
        |
        |
  =========`, 
  ` 
    +---+
    |   |
    O   |
    |   |
        |
        |
  =========`,
  ` 
    +---+
    |   |
    O   |
   /|   |
        |
        |
  =========`,
  ` 
    +---+
    |   |
    O   |
   /|\\ \|
        |
        |
  =========`,
  ` 
    +---+
    |   |
    O   |
   /|\\ \|
   /    |
        |
  =========`,
  ` 
    +---+
    |   |
    O   |
   /|\\ \|
   / \\ \|
        |
  =========`]
  
	start(rounds)
	
	function start(round) {
	  gameActive = true;
	  let item = shuffle.pick(json, { 'picks': 1 })
	  rounds = round
    word = item.word.toLowerCase()
	  clue = item.clue
	  splitword(word)
	}
	
  function splitword(string) {
    text = string.replace(/\w/g, '_').split('')
    if (rounds > 1) {
      updateMessage()
    }
  }
  
  function players(value) {
    return player[player.findIndex((obj => obj.id == value ))];
  }
  
  function botplayers(value) {
    return botplayer[botplayer.findIndex((obj => obj.id == value ))];
  }
  
  function reward() {
    return shuffle.pick([100,,150,200,300], { 'picks' : 1 })
  }
  
  function sortdata() {
    let source = []
    for(let a in player) {
      source.push(player[a])
    }
    if (isBot == true) {
      for(let b in botplayer) {
        source.push(botplayer[b])
      }
    }
    source.sort(function(a,b){return a.strike - b.strike});
    source.reverse();
    return source
  }
  
  function strike(ids) {
    if (players(ids).strike != 0) {
      players(ids).strike = (players(ids).strike)-1;
    }
    if (players(ids).strike === 0) {
      players(ids).status = ":skull_crossbones:";
    }
  }
  
  function failed(ids) {
    if (ids == msg.client.user.id) {
      return false
    } else {
      if (players(ids).strike === 0) {
        return true
      } else {
        return false
      }
    }
  }
  
  function isFull () {
    if(!text.includes("_")) {
      return true;
    } else {
      return false;
    }
  }
  
  function available (val) {
    let letter = text.filter(abc => abc === val)
    if (letter.length == 0) {
      return true
    } else {
      return false
    }
  }
  
  function checkword(letter) {
    let pass = false
    for(var i = 0; i < word.length; i++) {
      if (letter == word[i]) {
        text[i] = word[i]
        pass = true;
      }
    }
    return pass
  }
  
  function getWords() {
    return text.map(obj => obj).join('')
  }
  
  function getwinner() {
    let temp = []
    let win = []
    let lose = []
    for(let a in player) {
      temp.push(player[a])
    }
    if (isBot == true) {
      for(let b in botplayer) {
        temp.push(botplayer[b])
      }
    }
    win = temp.filter(obj => obj.status === "")
    lose = temp.filter(obj => obj.status === ":skull_crossbones:")
    win.sort(function(a,b){return a.strike - b.strike});
    lose.sort(function(a,b){return a.strike - b.strike});
    return {
      win:win,
      lose:lose
    }
  }
  
  function removePlayer(id) {
    let temp = []
    var rm = player.filter(obj => obj.id != id)
    for (let i in rm) {
      temp.push(rm[i])
    }
    player = []
    for (let i in temp) {
      player.push(temp[i])
    }
    updateMessage()
  }
  
  function playerStatus() {
    let data = sortdata()
    let survive = data.filter(obj => obj.status === "")
    let lose = data.filter(obj => obj.status === ":skull_crossbones:")
    if (lose.length >= 1) {
      return `Survive\n${getdata(survive)}\nHanged\n${getdata(lose)}`
    } else {
      return `Survive\n${getdata(survive)}`
    }
  }
  
  function getdata(object) {
    return object.map(obj => obj.status + " <@" + obj.id + "> " + obj.strike).join("\n")
  }
  
  function restart() {
    gameActive = false;
    if (rounds < maxrounds && point != 6) {
      start((rounds)+1)
      collector.resetTimer()
    } else {
      collector.stop("round")
    }
  }
  
  function updateMessage(correct = undefined) {
    if (correct != undefined && correct == "wrong") {
      point = (point) + 1
      getmsg(msg, messages[0]).then(m => {
        m.edit({
          embeds: [{
            description: `${getWords()}\n\n${hangman[point]}\n${playerStatus()}`,
            footer: {
              text: `${i18n.__mf("games.hangman.command.ingame.rounds",{
                round:rounds,
                maxround:maxrounds
              })} | leave`,
              icon_url: TIMER_GIF
            }
          }]
        })
      })
    } else {
      getmsg(msg, messages[0]).then(m => {
        m.edit({
          embeds: [{
            description: `${getWords()}\n\n${hangman[point]}\n${playerStatus()}`,
            footer: {
              text: `${i18n.__mf("games.hangman.command.ingame.rounds",{
                round:rounds,
                maxround:maxrounds
              })} | leave`,
              icon_url: TIMER_GIF
            }
          }]
        })
      })
    }
  }
  
  msg.channel.send({
    embeds: [{
      description: `${getWords()}\n\n${hangman[point]}\n${playerStatus()}`,
      footer: {
        text: `${i18n.__mf("games.hangman.command.ingame.rounds",{
          round:rounds,
          maxround:maxrounds
        })} | leave`,
        icon_url: TIMER_GIF
      }
    }]
  }).then(m => {
    messages.push(m.id)
  })
  
  if(isBot === true) {
    AIMove()
  }
  
  function AIMove () {
    if (rounds < maxrounds && point != 6) {
      let botword = word.replace(/\s/gm, '')
      let botAction = botword[Math.floor(Math.random() * botword.length)]
      let botAnswer = botAction;
      let posible = available(botAnswer)
      
      if (posible && gameActive == true) {
        return cpuMove(botAnswer)
      } else {
        setTimeout(() => {
          if (gameActive === true) {
            return AIMove()
          } else {
            return AIMove()
          }
        }, 2000)
      }
    } else {
      return;
    }
  }
  function cpuMove(botword) {
    msg.channel.sendTyping(msg.channel)
    setTimeout(() => {
      msg.channel.send(botword.toLowerCase()).then(() => {
        return AIMove()
      })
    }, 5000);
  }
  var interval = setInterval(function() {
    let data = player.filter(player => player.status === "");
    if (point === 6) {
      collector.stop('round')
    }
    if ((isBot && data.length == 0) || (!isBot && data.length === 1)) {
      collector.stop('round')
    } 
    if (isFull() && point != 6 && rounds < maxrounds) {
      restart()
    }
  }, 1000)
  
  function filter (m) {
    let content = m.content.toLowerCase();
    let author = m.author;
    let uid = player.some(obj => obj.id == author.id);
    let uuid = botplayer.some(obj => obj.id == author.id);
    if (uuid && checkword(content) && gameActive === true) {
      return content == content && author.id
    } else if (uid && failed(m.author.id) === false && gameActive === true) {
      return content == content && uid
    }
  }
  const collector = msg.channel.createMessageCollector({
    filter,
    time: 20000
  });
  
  collector.on("collect", m => {
    if(!player.find(obj => obj.id === m.author.id) && !isBot) return m.reply(i18n.__("games.notplayer"));
    if (gameActive === false) return;
    let people;
    let answer;
    const content = m.content.toLowerCase();
    const isHint = content === "hint";
    const isLeave = content === "leave";
    people = m.author.id
    answer = content
    clear(m)
    if (available && !isHint && !isLeave) {
      if (isFull()) {
        restart()
        collector.resetTimer()
      } else {
        if (checkword(answer) == true) {
          updateMessage()
          collector.resetTimer()
        } else {
          strike(people)
          updateMessage("wrong")
        }
      }
    } else if (!available && !isHint && !isLeave) {
      msg.reply(i18n.__("games.hangman.command.ingame.answered")).then(m => {
        clear(m, 5000)
      })
    } else if(isHint) {
      msg.reply(i18n.__mf("games.hangman.command.ingame.clue",{
    	  clue: clue
    	})).then(m => {
        clear(m, 5000)
      })
    } else if (isLeave) {
      removePlayer(people)
    }
  })
  
  collector.on("end", (collected, reason) => {
    let index = getwinner();
    let points = reward()
    clearInterval(interval)
    gameActive = false;
    game.started = false;
    if(reason == "round" || reason == "time") {
      getmsg(msg, messages[0]).then(msg => {
        msg.edit({
          embeds: [{
            description:`***${getWords()}***\n\n${hangman[point]}\n${i18n.__mf("games.hangman.command.ingame.gameover",{
            win:getdata(index.win),
            lose:getdata(index.lose)
        })}`}]
        }).then(msg => {
          clear(msg, 9000)
        })
      })
    }
  })
}
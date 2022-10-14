const { database, TIMER_GIF, remove, clear, embeds, games } = require(".././../util/util");
const db = database.ref("guild");
const shuffle = require(".././../util/shuffle-array");
const i18n = require(".././../util/i18n");

module.exports.help = {
  name: "math",
  aliases: ["matematika","mathematics","mtk"],
  cooldown: 3,
  category: "Games",
  multiplayer: false,
  usage: "",
  permissions: ["SEND_MESSAGES"],
  description: "games.math.description"
}

exports.run = async (msg, args, creator, game, client) => {
  if (!msg.guild.me.permissions.has("SEND_MESSAGES")) return msg.reply(i18n.__mf("common.command.permissions.missing",{perm:"`SEND_MESSAGES`"}));
  game.started = true;
  var messages = [];
  var dif = [];
  var operand = [];
  var hint = [];
  var left = [];
  var right = [];
  var rounds = [];
  var maxrounds = 10;
  var answer = false;
  var sum = 0;
  
  start(1)
  
  function start (round) {
    rounds = []
    rounds.push(round)
    picks()
  }
  function restart(respond) {
    sum = sum + 1;
    if (rounds < maxrounds){
      remove(msg, messages[0]).then(() => {
        msg.channel.send(embeds(i18n.__mf("games.math.ingame.answer",{
          h:hint[0],
          s:myscore()
        }))).then(msg => {
          clear(msg, 2000).then(() => {
            start((rounds[0])+1)
            collector.resetTimer()
          })
        })
      })
    } else {
      collector.stop("round")
    }
  }
  function picks() {
    dif = []
    operand = []
    var df = [10, 100, 500, 1000];
    var op = ['+', '-', '*', "/"];
    dif.push(shuffle.pick(df, {
      'picks': 1
    }))
    operand.push(shuffle.pick(op, {
      'picks': 1
    }))
		calculate(dif[0], operand[0])
  }
  function calculate(dif, opr) {
    left = [];
		right = [];
    var l = Math.floor(Math.random() * dif) + 1;
		var r = Math.floor(Math.random() * dif) + 1;
		var exam;
		left.push(l)
		right.push(r)
		if (opr == "+") {
		  hint = []
		  hint.push(left[0] + right[0])
		  exam = i18n.__mf("games.math.addition",{
		    l: left[0],
		    r: right[0]
		  });
		} else if (opr == "-") {
		  hint = []
		  hint.push(left[0] - right[0])
		  exam = i18n.__mf("games.math.multiplication",{
		    l: left[0],
		    r: right[0]
		  });
		} else if (opr == "*") {
		  hint = []
		  hint.push(left[0] * right[0])
		  exam = i18n.__mf("games.math.substraction",{
		    l: left[0],
		    r: right[0]
		  });
		} else if (opr == "/") {
		  var float = left[0] / right[0];
		  var str = float.toString();
		  if ((/\./g).test(str)) {
        str = str.split(".")[0]+"."+str.split(".")[1].slice(0,1)
      }
		  hint = []
		  hint.push(parseFloat(str))
		  exam = i18n.__mf("games.math.division",{
		    l: left[0],
		    r: right[0]
		  });
		}
		display(exam)
  }
  function myscore() {
    var scr = 0
    switch(sum) {
      case 0:
        scr = 0;
        break;
      case 1:
        scr = 10;
        break;
      case 2:
        scr = 20;
        break;
      case 3:
        scr = 30;
        break;
      case 4:
        scr = 40;
        break;
      case 5:
        scr = 50;
        break;
      case 6:
        scr = 60;
        break;
      case 7:
        scr = 70;
        break;
      case 8:
        scr = 80;
        break;
      case 9:
        scr = 90;
        break;
      case 10:
        scr = 100;
        break;
    }
    return scr;
  }
  function display(exam) {
    answer = false
    msg.channel.send(embeds(exam, {
      text: `${rounds[0]}/${maxrounds}`,
      url: TIMER_GIF
    })).then(msg => {
      messages = []
      messages.push(msg.id)
    })
  }
  
  const filter = m => m.author.id === creator.id;
  const collector = msg.channel.createMessageCollector({
    filter,
    time: 20000
  });
  
  collector.on("collect", m => {
    const unit = (/\./g).test(m.content) ? parseFloat(m.content) : parseInt(m.content);
    const isValid = unit === hint[0];
    if (isValid && answer == false) {
      answer = true
      restart(m.author.id)
      collector.resetTimer()
    } else if (!isValid && answer == false) {
      collector.stop("wrong")
    }
  })
  
  collector.on("end", (collected, reason) => {
    amswer = true
    game.started = false;
    if (reason == "time") {
      remove(msg, messages[0]).then(() => {
        msg.channel.send(embeds(i18n.__mf("games.math.ingame.timeout",{
          s:myscore()
        }))).then(msg => {
          clear(msg, 5000)
        })
      })
    } else if (reason == "wrong") {
      remove(msg, messages[0]).then(() => {
        msg.channel.send(embeds(i18n.__mf("games.math.ingame.wrong",{
          s:myscore()
        }))).then(msg => {
          clear(msg, 5000)
        })
      })
    } else if (reason == "round") {
      remove(msg, messages[0]).then(() => {
        msg.channel.send(embeds(i18n.__mf("games.math.ingame.round",{
          s:myscore()
        }))).then(msg => {
          clear(msg, 5000)
        })
      })
    }
  })
}
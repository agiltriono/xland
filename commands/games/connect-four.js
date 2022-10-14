const { MessageButton } = require("discord.js");
const fs = require("fs");
const path = require("path");
const i18n = require(".././../util/i18n");
const { database, TIMER_GIF, remove, clear, embeds, getmsg, games } = require(".././../util/util");
const db = database.ref("guild");
const shuffle = require(".././../util/shuffle-array");
const x = 0;
const o = 1;
const C4 = [x,o];
const red = ':red_circle:';
const green = ':green_circle:';
const colors = [red, green] 

module.exports.help = {
  name: "connect-four",
  aliases: ["c4"],
  cooldown: 3,
  category: "Games",
  multiplayer: true,
  usage: "",
  permissions: ["SEND_MESSAGES"],
  description: "games.C4.description"
}

exports.run = async function(msg, args, creator, game, client) {
  if (!msg.guild.me.permissions.has("SEND_MESSAGES")) return msg.reply(i18n.__mf("common.command.permissions.missing",{perm:"`SEND_MESSAGES`"}));
  game.started = true;
 // collector
  const player = [];
  const messages = [];
  const sides = [];
  var bot = false;
  const embedContent = i18n.__("games.lobby.usage");
  
  function players (value) {
   if (C4.some(obj => obj == value)) {
     return player[player.findIndex((obj => obj.side == value))];
   } else {
     return player[player.findIndex((obj => obj.id == value))];
   }
  }
  
  function update(messageId) {
    if(getmsg(msg, messageId) != undefined) {
        let joined = player.map(obj => i18n.__mf("games.lobby.joined", {playerid: obj.id, labels: obj.label })).join("\n");
       
        getmsg(msg, messageId).then(msg => {
          msg.edit(embeds(i18n.__mf("games.lobby.players", {content:embedContent, players:joined})))
        })
    } else {
      throw Error("Error updating object")
    }
  }
  
  function addplayer (id, invites) {
    let label = invites === 'join' ? 'joined' : 'added';
    let color = player.find(obj => obj .id == creator.id).color == colors[0] ? colors[1] : colors[0]; 
    player.push({
        side: o,
        color: color,
        id : id,
        label: label
    })
    update(messages[0])
  }
  msg.channel.send(embeds(embedContent)).then(msg => {
    messages.push(msg.id)
    player.push({
      side: x,
      color: shuffle.pick(colors, {'picks' : 1 }),
      id: creator.id,
      label: "host"
    })
    update(msg.id)
  })
  // Collector
  // collect all incoming msg
  const filter = m => m.content && m.author.id != m.client.user.id;
  const collector = msg.channel.createMessageCollector({filter, time : 20000 });
  
  collector.on("collect", m => {
    const author = m.author;
    const content = m.content;
    if (content.toLowerCase().startsWith("add")) {
      if (!player.some(obj => obj.id == m.author.id)) return m.reply(i18n.__("games.notjoin"));
      if (player.length > 1 && player.length < 3) return;
      const regex = /^<@!?[0-9]*>$/gm;
      const tag = content.toLowerCase().slice("add").trim().split(/ +/g);
        if (tag[1] == undefined) {
          m.reply(i18n.__("common.command.invalid"))
        } else {
          if (!regex.test(tag[1])) {
            if (tag[1].toLowerCase() === "bot") {
              if (!player.some(obj => obj.id == m.author.id)) return m.reply(i18n.__("games.notjoin"));
              if (player.length > 1 && player.length < 3) return;
              bot = true;
              addplayer(msg.client.user.id, "add");
            } else {
              m.reply(i18n.__("common.command.invalid"))
            }
          } else {
            const userid = tag[1].replace(/[\\<>@#&!]/g, "");
            if (players(userid) === undefined) {
              if (userid != msg.client.user.id && !m.mentions.members.first().user.bot) {
                addplayer(userid, "add")
              }
            } else {
              m.reply(i18n.__mf("games.lobby.alreadyjoin",{playerid: userid}))
            }
          }
        }
      } else if (content.toLowerCase() == "join") {
        if (players(author.id) == undefined) {
          addplayer(author.id, "join")
        } else {
          m.reply(i18n.__mf("games.lobby.alreadyjoin",{playerid: author.id}))
        }
      } else if (content.toLowerCase() == "start") {
        if (!player.some(obj => obj.id == m.author.id)) return m.reply(i18n.__("games.notjoin"));
        if (player.length > 1 && player.length < 3) {
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
        remove(msg, messages[0])
        if (bot == true) {
          AIplay(msg, player, game, bot)
        } else {
          HumanPlay(msg, player, game, client)
        }
        break;
      case "exit":
        game.started = false;
        remove(msg, messages[0])
        msg.channel.send(embeds(i18n.__("games.lobby.exit"))).then(msg => {
          clear(msg, 5000)
        })
        break;
      case "time":
        game.started = false;
        remove(msg,messages[0])
        msg.channel.send(embeds(i18n.__("common.commandTimeout"))).then(msg => {
          clear(msg, 5000)
        })
        break;
    }
  })
}

async function HumanPlay(msg, participant, game, client) {
var player = participant;
var button = [];
var messages = [];
var choice = [];
var turns = [];
turns.push(shuffle.pick(C4, {'picks':1}));
var gameActive = true;
var columns = ":one: :two: :three: :four: :five: :six: :seven:"
var gameState = [
           '', '', '', '', '', '',
           '', '', '', '', '', '',
           '', '', '', '', '', '',
           '', '', '', '', '', '',
           '', '', '', '', '', '',
           '', '', '', '', '', '',
           '', '', '', '', '', ''
           ];
const winningConditions = [ 
[0, 1, 2, 3], [41, 40, 39, 38],[7, 8, 9, 10], 
[34, 33, 32, 31], [14, 15, 16, 17], [27, 26, 25, 24], 
[21, 22, 23, 24], [20, 19, 18, 17], [28, 29, 30, 31], 
[13, 12, 11, 10], [35, 36, 37, 38], [6, 5, 4, 3], 
[0, 7, 14, 21], [41, 34, 27, 20], [1, 8, 15, 22], 
[40, 33, 26, 19], [2, 9, 16, 23], [39, 32, 25, 18], 
[3, 10, 17, 24], [38, 31, 24, 17], [4, 11, 18, 25], 
[37, 30, 23, 16], [5, 12, 19, 26], [36, 29, 22, 15], 
[6, 13, 20, 27], [35, 28, 21, 14], [0, 8, 16, 24], 
[41, 33, 25, 17], [7, 15, 23, 31], [34, 26, 18, 10], 
[14, 22, 30, 38], [27, 19, 11, 3], [35, 29, 23, 17], 
[6, 12, 18, 24], [28, 22, 16, 10], [13, 19, 25, 31], 
[21, 15, 9, 3], [20, 26, 32, 38], [36, 30, 24, 18], 
[5, 11, 17, 23], [37, 31, 25, 19], [4, 10, 16, 22], 
[2, 10, 18, 26], [39, 31, 23, 15], [1, 9, 17, 25], 
[40, 32, 24, 16], [9, 7, 25, 33], [8, 16, 24, 32], 
[11, 7, 23, 29], [12, 18, 24, 30], [1, 2, 3, 4], 
[5, 4, 3, 2], [8, 9, 10, 11], [12, 11, 10, 9],
[15, 16, 17, 18], [19, 18, 17, 16], [22, 23, 24, 25], 
[26, 25, 24, 23], [29, 30, 31, 32], [33, 32, 31, 30], 
[36, 37, 38, 39], [40, 39, 38, 37], [7, 14, 21, 28], 
[8, 15, 22, 29], [9, 16, 23, 30], [10, 17, 24, 31], 
[11, 18, 25, 32], [12, 19, 26, 33], [13, 20, 27, 34]
];
const gamepoint = [100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,300];
const rewards = shuffle.pick(gamepoint, {
  'picks' : 1 
});

const winMessage = () => {
  return `${i18n.__mf("games.C4.command.ingame.win",{
    player: players(turns[0]).id, 
    rewards: rewards
  })}\n\n${boards()}`
}

const forfeitMessage = (ids) => {
  return i18n.__mf("games.C4.command.ingame.forfeit",{
    player: ids
  })
}

const drawMessage = () => {
  return `${i18n.__("games.C4.command.ingame.draw")}\n\n${boards()}`
}

const gameOver = () => {
  return i18n.__("games.C4.command.ingame.gameover")
}

const ilegalMove = (i) => {
  return i.reply({ content: i18n.__mf("games.C4.command.ingame.ilegalMove", { player : players(turns[0]).id }), ephemeral : true })
}

const playerTurn = () => {
  const isturn = i18n.__("games.C4.command.ingame.isturn");
  const player1 = i18n.__mf("games.C4.command.ingame.player",{ 
    side: player[0].color,
    player: player[0].id, 
    turn: player[0].side == turns[0] ? isturn : "" });
  const player2 = i18n.__mf("games.C4.command.ingame.player",{ 
    side: player[1].color,
    player: player[1].id, 
    turn: player[1].side == turns[0] ? isturn : "" });
  return i18n.__mf("games.C4.command.ingame.turn", {
    player1: player1,
    player2: player2
  })
}

buttonCreate()

function players(value) {
  return player[player.findIndex((obj => obj.side == value))]
}
function Int(float) {
  var state = gameState;
  var int;
  if (float === 0) {
    if (state[35] == "") {
      int = 35
    } else if (state[28] == "") {
      int = 28
    } else if (state[21] == "") {
      int = 21
    } else if (state[14] == "") {
      int = 14
    } else if (state[7] == "") {
      int = 7
    } else if (state[0] == "") {
      int = 0
    } else {
      return false
    }
  } else if (float === 1) {
    if (state[36] == "") {
      int = 36
    } else if (state[29] == "") {
      int = 29
    } else if (state[22] == "") {
      int = 22
    } else if (state[15] == "") {
      int = 15
    } else if (state[8] == "") {
      int = 8
    } else if (state[1] == "") {
      int = 1
    } else {
      return false
    }
  } else if (float === 2) {
    if (state[37] == "") {
      int = 37
    } else if (state[30] == "") {
      int = 30
    } else if (state[23] == "") {
      int = 23
    } else if (state[16] == "") {
      int = 16
    } else if (state[9] == "") {
      int = 9
    } else if (state[2] == "") {
      int = 2
    } else {
      return false
    }
  } else if (float === 3) {
    if (state[38] == "") {
      int = 38
    } else if (state[31] == "") {
      int = 31
    } else if (state[24] == "") {
      int = 24
    } else if (state[17] == "") {
      int = 17
    } else if (state[10] == "") {
      int = 10
    } else if (state[3] == "") {
      int = 3
    } else {
      return false
    }
  } else if (float === 4) {
    if (state[39] == "") {
      int = 39
    } else if (state[32] == "") {
      int = 32
    } else if (state[25] == "") {
      int = 25
    } else if (state[18] == "") {
      int = 18
    } else if (state[11] == "") {
      int = 11
    } else if (state[4] == "") {
      int = 4
    } else {
      return false
    }
  } else if (float === 5) {
    if (state[40] == "") {
      int = 40
    } else if (state[33] == "") {
      int = 33
    } else if (state[26] == "") {
      int = 26
    } else if (state[19] == "") {
      int = 19
    } else if (state[12] == "") {
      int = 12
    } else if (state[5] == "") {
      int = 5
    } else {
      return false
    }
  } else if (float === 6) {
    if (state[41] == "") {
      int = 41
    } else if (state[34] == "") {
      int = 34
    } else if (state[27] == "") {
      int = 27
    } else if (state[20] == "") {
      int = 20
    } else if (state[13] == "") {
      int = 13
    } else if (state[6] == "") {
      int = 6
    } else {
      return false
    }
  }
  return int
}
function handlePlayed(index) {
  gameState[index] = players(turns[0]).color;
  handleResult()
  if (gameActive == true) {
    handleTurn(index);
  }
}

function handleTurn(index) {
  if (turns[0] == x) {
    turns = []
    turns.push(o)
  } else {
    turns = []
    turns.push(x)
  }
  buttonUpdate()
  display()
}

function handleResult() {
  let roundWon = false;
  let roundDraw = !gameState.includes("");
  for (let i = 0; i <= winningConditions.length -1; i++) {
    let winCondition = winningConditions[i];
    let a = gameState[winCondition[0]];
    let b = gameState[winCondition[1]];
    let c = gameState[winCondition[2]];
    let d = gameState[winCondition[3]];
    if (a === '' || b === '' || c === '' || d === '') {
      continue;
    }
    if (a == b && b == c && c == d) {
      roundWon = true;
      break;
    }
  }
  if (roundWon == true) {
    gameActive = false;
    collector.stop('win');
  }
  if (roundDraw) {
    gameActive = false;
    collector.stop('draw');
  }
}

function handleChoice(i, index) {
  if (Int(parseInt(index))) {
    if (gameState[Int(parseInt(index))] !== "" || !gameActive) {
      return;
    }
    choice = [];
    choice.push(parseInt(index))
    handlePlayed(Int(parseInt(index)));
  } else {
    ilegalMove(i)
  }
}

function buttonCreate() {
  let style = players(turns[0]).color == red ? "DANGER" : "SUCCESS";
  for(let i = 0; i <= 7; i++) {
    if (i != 7) {
      button.push(new MessageButton().setCustomId(i.toString()).setLabel((i+1).toString()).setStyle(style))
    } else {
      button.push(new MessageButton().setCustomId(i.toString()).setLabel(i18n.__("forfeit")).setStyle("DANGER"))
    }
  }
}

function buttonUpdate() {
  let style = players(turns[0]).color == red ? "DANGER" : "SUCCESS";
  for(let i = 0; i < button.length; i++) {
    if (button[i] != button[7]) {
      button[i].setStyle(style)
    }
  }
}

function selectRows() {
  let rows = []
  for (let i = 0; i <= 6; i++) {
    rows.push(":black_small_square:")
  }
  if (choice[0] != undefined) {
    rows[choice[0]] = ":arrow_down:"
  }
  return rows.map(col => col).join(" ")
}

function boards(tab = gameState) {
  let gameboard = []
  for (let i = 0; i < tab.length; i++) {
    gameboard.push(tab[i])
  }
  for (let i = 0; i < gameboard.length; i++) {
    if (gameboard[i] == "") {
      gameboard[i] = ":black_circle:"
    }
    if (gameboard[i] == red) {
      gameboard[i] = red
    }
    if (gameboard[i] == green) {
      gameboard[i] = green
    }
  }
  var chunk = (obj, i) => {
    let chunks = [];
    while(obj.length){
      chunks.push(obj.splice(0, i));
    }
    return chunks;
  }
  var divide = chunk(gameboard, 7);
  return `${selectRows()}\n${divide.map(obj => obj.map(col => col).join(" ")).join("\n")}\n${columns}`
}
const row1 = {
  type : 1,
  components:[button[0],button[1],button[2]
,button[3],button[4]]
}
const row2 = {
  type: 1,
  components:[button[5],button[6],button[7]]
}

function display() {
 getmsg(msg, messages[0]).then(m => {
    m.edit({
      embeds: [{
        description: `${playerTurn()}\n\n${boards()}`,
        footer: {
          text: `host ${msg.client.users.cache.get(player.find(obj => obj.label === "host").id).username}`,
          icon_url: TIMER_GIF
        }
      }],
      components : [row1,row2]
    })
 })
}

if (msg.deferred == false){
    await msg.deferReply()
};

const message = await msg.channel.send({
  embeds: [{
    description: `${playerTurn()}\n\n${boards()}`,
    footer: {
      text: `host ${msg.client.users.cache.get(player.find(obj => obj.label === "host").id).username}`,
      icon_url: TIMER_GIF
    }
  }],
  components : [row1,row2]
})

messages.push(message.id)
    
  const collector = message.createMessageComponentCollector({
    componentType: 'BUTTON',
    time: 20000
  });
  
  collector.on("collect", async (m) => {
    if (!player.some(obj => obj.id == m.user.id)) return m.reply({ content : i18n.__("games.notplayer"), ephemeral: true });
    if(m.user.id === players(turns[0]).id && m.customId != button[7].customId) {
      switch (m.customId) {
        case button[0].customId:
          handleChoice(m, 0)
          break;
        case button[1].customId:
          handleChoice(m, 1)
          break;
        case button[2].customId:
          handleChoice(m, 2)
          break;
        case button[3].customId:
          handleChoice(m, 3)
          break;
        case button[4].customId:
          handleChoice(m, 4)
          break;
        case button[5].customId:
          handleChoice(m, 5)
          break;
        case button[6].customId:
          handleChoice(m, 6)
          break;
      }
      collector.resetTimer();
    } else if (player.some(obj => obj.id === m.user.id) && m.customId === button[7].customId) {
      collector.stop("forfeit")
    } else {
      m.reply({ content: i18n.__mf("games.C4.command.ingame.notturn", {
        player:m.user.id
      }), ephemeral: true })
    }
  });
  
  collector.on("end", (collected, reason) => {
    game.started = false
    if (reason == "time") {
      remove(msg, messages[0]).then(() => {
        msg.channel.send(embeds(gameOver())).then(msg => {
          clear(msg, 9000)
        })
      })
    } else if (reason == "win") {
      remove(msg, messages[0]).then(() => {
        msg.channel.send(embeds(winMessage())).then(msg => {
          clear(msg, 9000)
        })
      })
    } else if (reason == "draw") {
      remove(msg, messages[0]).then(() => {
        msg.channel.send(embeds(drawMessage())).then(msg => {
          clear(msg, 9000)
        })
      })
    } else if (reason == "forfeit") {
      remove(msg, messages[0]).then(() => {
        msg.channel.send(embeds(forfeitMessage(collected.first().user.id))).then(msg => {
          clear(msg, 9000)
        })
      })
    }
  });
}
class AIBoard {
  constructor (game, board, player) {
    this.game = game;
    this.board = board;
    this.player = player;
  }
  isFinished (depth, score) {
    if (depth == 0 || score == this.game.score || score == -this.game.score || this.isFull()) {
      return true;
    }
    return false;
  }
  move (column) {
    if (this.board[0][column] == null && column >= 0 && column < this.game.columns) {
      for (var y = this.game.rows - 1; y >= 0; y--) {
        if (this.board[y][column] == null) {
          this.board[y][column] = this.player;
          break;
        }
      }
      this.player = this.game.switchRound(this.player)
      return true;
    } else {
      return false;
    }
  }
  scorePosition (row, column, delta_y, delta_x) {
    var human_points = 0;
    var computer_points = 0;
    this.game.winning_array_human = [];
    this.game.winning_array_cpu = [];
    for (var i = 0; i < 4; i++) {
      if (this.board[row][column] == 0) {
        this.game.winning_array_human.push([row, column]);
        human_points++;
      } else if (this.board[row][column] == 1) {
        this.game.winning_array_cpu.push([row, column]);
        computer_points++;
      }
      // Moving through our board
      row += delta_y;
      column += delta_x;
    }
    // Marking winning/returning score
    if (human_points == 4) {
      this.game.winning_array = this.game.winning_array_human;
      // Computer won (100000)
      return -this.game.score;
    } else if (computer_points == 4) {
      this.game.winning_array = this.game.winning_array_cpu;
      // Human won (-100000)
      return this.game.score;
    } else {
      // Return normal points
      return computer_points;
    }
  }
  score () {
    // AIBoard-size: 7x6 (height x width)
    // Array indices begin with 0
    // => e.g. height: 0, 1, 2, 3, 4, 5
    var points = 0;
    var vertical_points = 0;
    var horizontal_points = 0;
    var diagonal_points1 = 0;
    var diagonal_points2 = 0;
    for (var row = 0; row < this.game.rows - 3; row++) {
      for (var column = 0; column < this.game.columns; column++) {
        var score = this.scorePosition(row, column, 1, 0);
        if (score == this.game.score) return this.game.score;
        if (score == -this.game.score) return -this.game.score;
        vertical_points += score;
      }
    }
    for (var row = 0; row < this.game.rows; row++) {
      for (var column = 0; column < this.game.columns - 3; column++) { 
        var score = this.scorePosition(row, column, 0, 1);   
        if (score == this.game.score) return this.game.score;
        if (score == -this.game.score) return -this.game.score;
        horizontal_points += score;
      }
    }
    for (var row = 0; row < this.game.rows - 3; row++) {
      for (var column = 0; column < this.game.columns - 3; column++) {
        var score = this.scorePosition(row, column, 1, 1);
        if (score == this.game.score) return this.game.score;
        if (score == -this.game.score) return -this.game.score;
        diagonal_points1 += score;
      }  
    }
    for (var row = 3; row < this.game.rows; row++) {
      for (var column = 0; column <= this.game.columns - 4; column++) {
        var score = this.scorePosition(row, column, -1, +1);
        if (score == this.game.score) return this.game.score;
        if (score == -this.game.score) return -this.game.score;
        diagonal_points2 += score;
      }
    }
    points = horizontal_points + vertical_points + diagonal_points1 + diagonal_points2;
    return points;
  }
  isFull () {
    for (var i = 0; i < this.game.columns; i++) {
      if (this.board[0][i] == null) {
        return false;
      }
    }
    return true;
  }
  
  copy () {
    var new_board = new Array();
    for (var i = 0; i < this.board.length; i++) {
      new_board.push(this.board[i].slice());
    }
    return new AIBoard(this.game, new_board, this.player);
  }
}

class AI {
  constructor (turn) {
    this.rows = 6;
    this.columns = 7;
    this.status = 0;
    this.depth = 4;
    this.score = 100000;
    this.round = turn;
    this.winning_array = [];
    this.iterations = 0;
    this.init()
  }
  init() {
    this.vboard = [
           [null, null, null, null, null, null],
           [null, null, null, null, null, null],
           [null, null, null, null, null, null],
           [null, null, null, null, null, null],
           [null, null, null, null, null, null],
           [null, null, null, null, null, null],
           [null, null, null, null, null, null]
           ];
    this.gameBoard = new Array(this.rows);
    for (var r = 0; r < this.gameBoard.length; r++) {
      this.gameBoard[r] = new Array(this.columns);
      for (var c = 0; c < this.gameBoard[r].length; c++) {
        this.gameBoard[r][c] = null;
      }
    }
    this.board = new AIBoard(this, this.gameBoard, this.round);
  }
  available (column, color) {
    this.move(column, color)
    if (!this.board.move(column)) {
      return false
    } else {
      this.round = this.switchRound(this.round)
      this.updateStatus();
      return true
    }
  }
  move (column, color) {
    if (this.board.score() != this.score && this.board.score() != -this.score && !this.board.isFull()) {
      for (var y = this.rows -1; y >= 0; y--) {
        if (this.vboard[y][column] == null) {
          if (this.round == 1) {
            this.vboard[y][column] = color;
          } else {
            this.vboard[y][column] = color;
          }
          break;
        }
      }
    }
  }
  cpu () {
    if (this.board.score() != this.score && this.board.score() != -this.score && !this.board.isFull()) {
        this.iterations = 0; 
      let ai_move = this.minimax(true, this.board, this.depth);
      return parseInt(ai_move[0])
    }
  }
  minimax (maximize, board, depth, alpha, beta) {
    var max = [null, -99999];
    var min = [null, 99999];
    var score = board.score();
    if (board.isFinished(depth, score)) return [null, score];
    if(maximize) {
      for (var column = 0; column < this.columns; column++) {
          var new_board = board.copy();
        if (new_board.move(column)) {
          this.iterations++;
          var next_move = this.minimax(false, new_board, depth -1, alpha, beta);
          if (max[0] == null || next_move[1] > max[1]) {
            max[0] = column;
            max[1] = next_move[1];
            alpha = next_move[1];
          }
          if (alpha >= beta) return max;
        }
      }
      return max;
    }
    if(!maximize) {
      for (var column = 0; column < this.columns; column++) {
          var new_board = board.copy();
        if (new_board.move(column)) {
          this.iterations++;
          var next_move = this.minimax(true, new_board, depth - 1, alpha, beta);
          if (min[0] == null || next_move[1] < min[1]) {
            min[0] = column;
            min[1] = next_move[1];
            beta = next_move[1];
          }
          if (alpha >= beta) return min;
        }
      }
      return min;
    }
  }
  switchRound (round) {
    switch(round) {
      case 0:
        return 1
        break;
      case 1:
        return 0
        break;
    }
  }
  updateStatus () {
    // 1 : Win | 2 : AI Win | 3 : Tie
    if (this.board.score() == -this.score) {
      this.status = 1;
    }
    if (this.board.score() == this.score) {
      this.status = 2;
    }
    if (this.board.isFull()) {
      this.status = 3;
    }
  }
  getStatus () {
    return this.status
  }
  print (c1, c2, c3) {
    var string = [];
    for(var r = 0; r < this.rows; r++) {
      var row = [];
      for(var c = 0; c < this.columns; c++) {
        let index = this.vboard[r][c];
        if(index == c1) {
          row.push(c1);
        }
        else if(index == c2) {
          row.push(c2);
        }
        else row.push(c3);
      }
      string.push(row.join(' '));
    }
    return string.join('\n')
  }
}
async function AIplay(msg, participant, game, bot) {
var player = participant;
var button = [];
var messages = [];
var choice = [];
var columns = ':one: :two: :three: :four: :five: :six: :seven:';
var turns = [];
turns.push(shuffle.pick(C4, {'picks':1}));
const gamepoint = [100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,300];
const rewards = shuffle.pick(gamepoint, {
  'picks' : 1 
});
var ai = new AI(turns[0])
 
const winMessage = () => {
  if (players(turns[0]).side === x) {
    return `${i18n.__mf("games.C4.command.ingame.win",{ player: players(turns[0]).id, rewards: rewards })}\n\n${boards()}`;
  } else {
    return `${i18n.__mf("games.C4.command.ingame.aiwin",{player: players(turns[0]).id })}\n\n${boards()}`;
  }
}

const forfeitMessage = (ids) => {
  return i18n.__mf("games.C4.command.ingame.forfeit",{
    player: ids
  })
};

const drawMessage = () => {
  return `${i18n.__("games.C4.command.ingame.draw")}\n\n${boards()}`
};

const gameOver = () => {
  return i18n.__("games.C4.command.ingame.gameover")
}

const ilegalMove = (i) => {
  return i.reply({ content: i18n.__mf("games.C4.command.ingame.ilegalMove", { player : players(turns[0]).id }), ephemeral : true })
};

const playerTurn = () => {
  const isturn = i18n.__("games.C4.command.ingame.isturn");
  const player1 = i18n.__mf("games.C4.command.ingame.player",{ 
    side: player[0].color,
    player: player[0].id, 
    turn: player[0].side == turns[0] ? isturn : "" });
  const player2 = i18n.__mf("games.C4.command.ingame.player",{ 
    side: player[1].color,
    player: player[1].id, 
    turn: player[1].side == turns[0] ? isturn : "" });
  return i18n.__mf("games.C4.command.ingame.turn", {
    player1: player1,
    player2: player2
  })
};

buttonCreate()

function players(value) {
  let index = player.findIndex((obj => obj.side == value));
  return player[index]
}
function handlePlayed() {
  let status = parseInt(ai.getStatus());
  if (status === 1 || status === 2) {
    collector.stop('win')
  } else if(status === 3) {
    collector.stop('draw')
  } else if (status === 0) {
    collector.resetTimer()
    handleTurn();
  }
}
function handleTurn() {
  if (turns[0] == x) {
    turns = []
    turns.push(o)
  } else {
    turns = []
    turns.push(x)
  }
  buttonUpdate()
  display()
}
function handleChoice(i, index) {
  if (!ai.available(index, players(turns[0]).color)) return ilegalMove(i);
  choice = [];
  choice.push(index)
  handlePlayed()
}
function buttonCreate() {
  let style = players(turns[0]).color == red ? "DANGER" : "SUCCESS";
  for(let i = 0; i <= 7; i++) {
    if (i != 7) {
      if (turns[0] == 1) {
        button.push(new MessageButton().setCustomId(i.toString()).setLabel((i + 1).toString()).setStyle(style).setDisabled(true))
      } else {
        button.push(new MessageButton().setCustomId(i.toString()).setLabel((i+1).toString()).setStyle(style))
      }
    } else {
      button.push(new MessageButton().setCustomId(i.toString()).setLabel(i18n.__("forfeit")).setStyle("DANGER"))
    }
  }
}
function buttonUpdate() {
  let style = players(turns[0]).color == red ? "DANGER" : "SUCCESS";
  for(let i = 0; i < button.length; i++) {
    if (button[i] != button[7]) {
      button[i].setStyle(style)
    }
    if (turns[0] === 1) {
      button[i].setDisabled(true)
    } else if (turns[0] === 0) {
      button[i].setDisabled(false)
    }
  }
}
function selectRows() {
  let rows = []
  for (let i = 0; i <= 6; i++) {
    rows.push(":black_small_square:")
  }
  if (choice[0] != undefined) {
    rows[choice[0]] = ":arrow_down:"
  }
  return rows.map(col => col).join(" ")
}
function boards () {
  return `${selectRows()}\n${ai.print(player[0].color, player[1].color, ':black_circle:')}\n${columns}`
}
const row1 = {
  type : 1,
  components:[button[0],button[1],button[2]
,button[3],button[4]]
}
const row2 = {
  type: 1,
  components:[button[5],button[6],button[7]]
}

function display() {
 getmsg(msg, messages[0]).then(m => {
    m.edit({
      embeds: [{
        description: `${playerTurn()}\n\n${boards()}`,
        footer: {
          text: `host ${msg.client.users.cache.get(player.find(obj => obj.label === "host").id).username}`,
          icon_url: TIMER_GIF
        }
      }],
      components : [row1,row2]
    }).then(i => {
      if (turns[0] == 1) {
        setTimeout(() => handleChoice(i, ai.cpu()), 1000)
      }
    })
 })
}

if (msg.deferred == false){
    await msg.deferReply()
};

const message = await msg.channel.send({
  embeds: [{
    description: `${playerTurn()}\n\n${boards()}`,
    footer: {
      text: `host ${msg.client.users.cache.get(player.find(obj => obj.label === "host").id).username}`,
      icon_url: TIMER_GIF
    }
  }],
  components : [row1,row2]
})

messages.push(message.id)

if (turns[0] == 1) {
  setTimeout(() => handleChoice(msg, ai.cpu()), 1000)
}

  const collector = message.createMessageComponentCollector({
    componentType: 'BUTTON',
    time: 20000
  });
  
  collector.on("collect", async (m) => {
    if (!player.some(obj => obj.id == m.user.id)) return m.reply({ content : i18n.__("games.notplayer"), ephemeral: true });
    if(m.user.id === players(turns[0]).id && m.customId != button[7].customId) {
      switch (m.customId) {
        case button[0].customId:
          handleChoice(m, 0)
          break;
        case button[1].customId:
          handleChoice(m, 1)
          break;
        case button[2].customId:
          handleChoice(m, 2)
          break;
        case button[3].customId:
          handleChoice(m, 3)
          break;
        case button[4].customId:
          handleChoice(m, 4)
          break;
        case button[5].customId:
          handleChoice(m, 5)
          break;
        case button[6].customId:
          handleChoice(m, 6)
          break;
      }
      collector.resetTimer();
    } else if (player.some(obj => obj.id === m.user.id) && m.customId === button[7].customId) {
      collector.stop("forfeit")
    } else {
      m.reply({ content: i18n.__mf("games.C4.command.ingame.notturn", {
        player:m.user.id
      }), ephemeral: true })
    }
  });
  
  collector.on("end", (collected, reason) => {
    game.started = false
    if (reason == "time") {
      remove(msg, messages[0]).then(() => {
        msg.channel.send(embeds(gameOver())).then(msg => {
          clear(msg, 9000)
        })
      })
    } else if (reason == "win") {
      remove(msg, messages[0]).then(() => {
        msg.channel.send(embeds(winMessage())).then(msg => {
          clear(msg, 9000)
        })
      })
    } else if (reason == "draw") {
      remove(msg, messages[0]).then(() => {
        msg.channel.send(embeds(drawMessage())).then(msg => {
          clear(msg, 9000)
        })
      })
    } else if (reason == "forfeit") {
      remove(msg, messages[0]).then(() => {
        msg.channel.send(embeds(forfeitMessage(collected.first().user.id))).then(msg => {
          clear(msg, 9000)
        })
      })
    }
  });
}
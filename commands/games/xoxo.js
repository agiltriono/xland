const { MessageActionRow, MessageButton } = require("discord.js");
const fs = require("fs");
const path = require("path");
const i18n = require(".././../util/i18n");
const { database, TIMER_GIF, remove, clear, embeds, getmsg } = require(".././../util/util")
const db = database.ref("guild");
const shuffle = require(".././../util/shuffle-array");
const x = 'X';
const o = 'O';
const XOXO = [x,o];

module.exports.help = {
  name: "xoxo",
  aliases: ["tictactoe"],
  cooldown: 10,
  category: "Games",
  multiplayer: true,
  usage: "",
  permissions: ["SEND_MESSAGES"],
  description: "games.xoxo.description"
}

exports.run = async function(msg, args, creator, client) {
  if (!msg.guild.me.permissions.has("SEND_MESSAGES")) return msg.reply(i18n.__mf("common.command.permissions.missing",{perm:"`SEND_MESSAGES`"}));
  
 // collector
  const player = [];
  const botplayer = [];
  const messages = [];
  const sides = [];
  var bot = false;
  const embedContent = i18n.__("games.lobby.usage");
  
  function players (value) {
   if (XOXO.some(obj => obj == value)) {
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
    let label = invites === 'joined' ? invites : 'added';
    if (players(x) === undefined) {
      player.push({
           side: x,
           id : id,
           label: label
            })
    } else if (players(o) === undefined) {
      player.push({
           side: o,
           id : id,
           label: label
      })
    }
    update(messages[0])
  }
  
  msg.channel.send(embeds(embedContent)).then(msg => {
    messages.push(msg.id)
    player.push({
      side: shuffle.pick(XOXO, { 'picks' : 1 }),
      id: creator.id,
      label: "host"
    })
    update(msg.id)
  })
  // Collector
  // collect all incoming msg
  const filter = m => m.content && m.author.id != m.client.user.id;
  const collector = msg.channel.createMessageCollector({ filter, time : 20000 });
  
  collector.on("collect", m => {
    const author = m.author;
    const content = m.content;
    if (content.toLowerCase().startsWith("add")) {
      if (!player.some(obj => obj.id == m.author.id)) return m.reply(i18n.__("games.notjoin"));
      if (player.length > 1 && player.length < 3) return;
      const regex = /^<@!?[0-9]*>$/gm;
      const tag = content.toLowerCase().slice("add").trim().split(/ +/g);
        if (tag[1] == undefined) {
          m.reply(i18n.__("common.command.invalid")).then(msg => {
            clear(msg, 2000)
          })
        } else {
          if (!regex.test(tag[1])) {
            if (tag[1].toLowerCase() === "bot") {
              if (!player.some(obj => obj.id == m.author.id)) return m.reply(i18n.__("games.notjoin"));
              if (player.length > 1 && player.length < 3) return;
              bot = true;
              addplayer(msg.client.user.id, "add");
            } else {
              m.reply(i18n.__("common.command.invalid")).then(msg => {
                clear(msg, 2000)
              })
            }
          } else {
            const userid = tag[1].replace(/[\\<>@#&!]/g, "");
            if (players(userid) === undefined) {
              if (userid != msg.client.user.id && !m.mentions.members.first().user.bot) {
                addplayer(userid, "add")
              }
            } else {
              m.reply(i18n.__mf("games.lobby.alreadyjoin",{playerid: userid})).then(msg => {
                clear(msg, 2000)
              })
            }
          }
        }
      } else if (content.toLowerCase() == "join") {
        if (players(author.id) == undefined) {
          if (player.length > 1 && player.length < 3) return;
          addplayer(author.id, "join")
        } else {
          m.reply(i18n.__mf("games.lobby.alreadyjoin",{playerid: author.id})).then(msg => {
            clear(msg, 2000)
          })
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
        play(msg, player, bot, client)
        break;
      case "exit":
        
        remove(msg, messages[0])
        msg.channel.send(embeds(i18n.__("games.lobby.exit"))).then(msg => {
          clear(msg, 5000)
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

class Board {
    //Initializing the board
    constructor(state = ['','','','','','','','','']) {
        this.state = state;
    }
    //Logs a visualized board with the current state to the console
    printBoard() {
    	let formattedString = '';
        this.state.forEach((cell, index) => {
        	formattedString += cell ? ` ${cell} |` : '   |';
        	if((index + 1) % 3 === 0)  {
        		formattedString = formattedString.slice(0,-1);
        		if(index < 8) formattedString += '\n\u2015\u2015\u2015 \u2015\u2015\u2015 \u2015\u2015\u2015\n';
        	}
		});
		console.log('%c' + formattedString, 'color: #c11dd4;font-size:16px');
    }
    //Checks if board has no symbols yet
    isEmpty() {
        return this.state.every(cell => !cell);
    }
    //Check if board has no spaces available
    isFull() {
        return this.state.every(cell => cell);
    }
    /**
     * Inserts a new symbol(x,o) into
     * @param {String} symbol 
     * @param {Number} position
     * @return {Boolean} boolean represent success of the operation
     */
    insert(symbol, position) {
        if(![0,1,2,3,4,5,6,7,8].includes(position)) {
            throw new Error(`Cell index ${position} does not exist!`)
        }
        if(!['X','O'].includes(symbol)) {
            throw new Error('The symbol can only be x or o!')
        }
        if(this.state[position]) {
            return false;
        }
    	this.state[position] = symbol;
    	return true;
    }
    //Returns an array containing available moves for the current state
    getAvailableMoves() {
        const moves = [];
        this.state.forEach((cell, index) => {
            if(!cell) moves.push(index); 
        });
        return moves;
    }
    /**
     * Checks if the board has a terminal state ie. a player wins or the board is full with no winner
     * @return {Object} an object containing the winner, direction of winning and row number
     */
    isTerminal() {
    	//Return False if board in empty
        if(this.isEmpty()) return false;
        //Checking Horizontal Wins
        if(this.state[0] === this.state[1] && this.state[0] === this.state[2] && this.state[0]) {
            return {'winner': this.state[0], 'direction': 'H', 'row': 1};
        }
        if(this.state[3] === this.state[4] && this.state[3] === this.state[5] && this.state[3]) {
            return {'winner': this.state[3], 'direction': 'H', 'row': 2};
        }
        if(this.state[6] === this.state[7] && this.state[6] === this.state[8] && this.state[6]) {
            return {'winner': this.state[6], 'direction': 'H', 'row': 3};
        }

        //Checking Vertical Wins
        if(this.state[0] === this.state[3] && this.state[0] === this.state[6] && this.state[0]) {
            return {'winner': this.state[0], 'direction': 'V', 'column': 1};
        }
        if(this.state[1] === this.state[4] && this.state[1] === this.state[7] && this.state[1]) {
            return {'winner': this.state[1], 'direction': 'V', 'column': 2};
        }
        if(this.state[2] === this.state[5] && this.state[2] === this.state[8] && this.state[2]) {
            return {'winner': this.state[2], 'direction': 'V', 'column': 3};
        }

        //Checking Diagonal Wins
        if(this.state[0] === this.state[4] && this.state[0] === this.state[8] && this.state[0]) {
            return {'winner': this.state[0], 'direction': 'D', 'diagonal': 'main'};
        }
        if(this.state[2] === this.state[4] && this.state[2] === this.state[6] && this.state[2]) {
            return {'winner': this.state[2], 'direction': 'D', 'diagonal': 'counter'};
        }

        //If no winner but the board is full, then it's a draw
        if(this.isFull()) {
            return {'winner': 'draw'};
        }

        //return false otherwise
        return false;
    }
}

class AI {
    constructor(maxDepth = -1) {
        this.maxDepth = maxDepth;
        this.nodesMap = new Map();
    }
    getBestMove(board, maximizing = true, callback = () => {}, depth = 0) {
        //clear nodesMap if the function is called for a new move
        if (depth == 0) this.nodesMap.clear();

        //If the board state is a terminal one, return the heuristic value
        if (board.isTerminal() || depth === this.maxDepth) {
            if (board.isTerminal().winner === "X") {
                return 100 - depth;
            } else if (board.isTerminal().winner === "O") {
                return -100 + depth;
            }
            return 0;
        }
        if (maximizing) {
            //Initialize best to the lowest possible value
            let best = -100;
            //Loop through all empty cells
            board.getAvailableMoves().forEach(index => {
                //Initialize a new board with a copy of our current state
                const child = new Board([...board.state]);
                //Create a child node by inserting the maximizing symbol x into the current empty cell
                child.insert("X", index);
                //Recursively calling getBestMove this time with the new board and minimizing turn and incrementing the depth
                const nodeValue = this.getBestMove(child, false, callback, depth + 1);
                //Updating best value
                best = Math.max(best, nodeValue);

                //If it's the main function call, not a recursive one, map each heuristic value with it's moves indices
                if (depth == 0) {
                    //Comma separated indices if multiple moves have the same heuristic value
                    const moves = this.nodesMap.has(nodeValue)
                        ? `${this.nodesMap.get(nodeValue)},${index}`
                        : index;
                    this.nodesMap.set(nodeValue, moves);
                }
            });
            //If it's the main call, return the index of the best move or a random index if multiple indices have the same value
            if (depth == 0) {
                let returnValue;
                if (typeof this.nodesMap.get(best) == "string") {
                    const arr = this.nodesMap.get(best).split(",");
                    const rand = Math.floor(Math.random() * arr.length);
                    returnValue = arr[rand];
                } else {
                    returnValue = this.nodesMap.get(best);
                }
                //run a callback after calculation and return the index
                callback(returnValue);
                return returnValue;
            }
            //If not main call (recursive) return the heuristic value for next calculation
            return best;
        }

        if (!maximizing) {
            //Initialize best to the highest possible value
            let best = 100;
            //Loop through all empty cells
            board.getAvailableMoves().forEach(index => {
                //Initialize a new board with a copy of our current state
                const child = new Board([...board.state]);

                //Create a child node by inserting the minimizing symbol o into the current empty cell
                child.insert("O", index);

                //Recursively calling getBestMove this time with the new board and maximizing turn and incrementing the depth
                let nodeValue = this.getBestMove(child, true, callback, depth + 1);
                //Updating best value
                best = Math.min(best, nodeValue);

                //If it's the main function call, not a recursive one, map each heuristic value with it's moves indices
                if (depth == 0) {
                    //Comma separated indices if multiple moves have the same heuristic value
                    const moves = this.nodesMap.has(nodeValue)
                        ? this.nodesMap.get(nodeValue) + "," + index
                        : index;
                    this.nodesMap.set(nodeValue, moves);
                }
            });
            //If it's the main call, return the index of the best move or a random index if multiple indices have the same value
            if (depth == 0) {
                let returnValue;
                if (typeof this.nodesMap.get(best) == "string") {
                    const arr = this.nodesMap.get(best).split(",");
                    const rand = Math.floor(Math.random() * arr.length);
                    returnValue = arr[rand];
                } else {
                    returnValue = this.nodesMap.get(best);
                }
                //run a callback after calculation and return the index
                callback(returnValue);
                return returnValue;
            }
            //If not main call (recursive) return the heuristic value for next calculation
            return best;
        }
    }
}

async function play(msg, participant, bot, client) {
var player = participant;
var button = [];
var messages = [];
var gameActive = true;
var turns = [];
turns.push(shuffle.pick(XOXO, {'picks':1}));
var gameState = ['','','','','','','','',''];
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
const AIBoard = new Board(gameState);
const AIplayer = new AI();

const rewards = shuffle.pick([200, 150, 300], {  'picks' : 1 });

const winMessage = () => {
  if (players(turns[0]).id != msg.client.user.id) {
    return i18n.__mf("games.xoxo.command.ingame.win",{player:players(turns[0]).id}) + i18n.__mf("games.xoxo.command.ingame.rewards",{ rewards: rewards });
  } else {
    return i18n.__mf("games.xoxo.command.ingame.win",{player:players(turns[0]).id});
  }
}

const forfeitMessage = (ids) => {
  return i18n.__mf("games.xoxo.command.ingame.forfeit",{
    player: ids
  })
}

const drawMessage = () => {
  return i18n.__("games.xoxo.command.ingame.draw")
}

const gameOver = () => {
  return i18n.__("games.xoxo.command.ingame.gameover")
}

const playerTurn = () => {
  const isturn = i18n.__("games.xoxo.command.ingame.isturn");
  const player1 = i18n.__mf("games.xoxo.command.ingame.player",{ 
    side: player[0].side,
    player: player[0].id, 
    turn: player[0].side == turns[0] ? isturn : "" });
  const player2 = i18n.__mf("games.xoxo.command.ingame.player",{ 
    side: player[1].side,
    player: player[1].id, 
    turn: player[1].side == turns[0] ? isturn : "" });
  return i18n.__mf("games.xoxo.command.ingame.turn", {
    player1: player1,
    player2: player2
  })
};

buttonCreate()

function players(value) {
  let index = player.findIndex((obj => obj.side == value));
  return player[index]
}

function AIMove() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(AIplayer.getBestMove(AIBoard))
    }, 3000)
  })
}

function handlePlayed(index) {
  AIBoard.insert(turns[0],parseInt(index));
  buttonUpdate(index, false)
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
  buttonUpdate(index, true)
  display(playerTurn())
}

function handleResult() {
    let roundWon = false;
    let roundDraw = false;
    let state = false;
    for (let i = 0; i <= winningConditions.length -1; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        let win = a === b && b === c;
        let draw = !win && !gameState.includes('');
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (win) {
            roundWon = true;
            break;
        }
        if (draw) {
            roundDraw = true;
            break;
        }
    }

    if (roundWon == true) {
        state = 'win';
        gameActive = false;
        collector.stop('win');
    }

    if (roundDraw == true) {
        state = 'draw'
        gameActive = false;
        collector.stop('draw');
    }
    return state
}

function handleChoice(index) {
    if (gameState[parseInt(index)] !== "" || !gameActive) {
        return;
    }
    handlePlayed(parseInt(index));
}

function btn (id, label, style) {
  return new MessageButton()
  .setCustomId(id.toString())
  .setLabel(label)
  .setStyle(style);
}

function buttonCreate() {
  let label = turns[0];
  let style = label == x ? "DANGER" : "SUCCESS";
  for(let i = 0; i <= 9; i++) {
    if (i != 9) {
      button.push(btn(i,label,style))
    } else {
      button.push(btn(i,i18n.__("forfeit"),"DANGER"))
    }
  }
}

function buttonUpdate(id, all) {
  let label = turns[0];
  let style = label == x ? "DANGER" : "SUCCESS";
  if (all == false) {
    button[id].setLabel(label);
    button[id].setStyle(style);
    button[id].setDisabled(true);
  } else {
    for(let i = 0; i < button.length; i++) {
      if (button[i].disabled == false && button[i] != button[9]) {
        button[i].setLabel(label)
        button[i].setStyle(style)
      }
    }
  }
}

const row1 = {
  type: 1,
  components: [button[0],button[1],button[2]
]}
const row2 = {
  type: 1,
  components: [button[3],button[4],button[5]
]}
const row3 = {
  type: 1,
  components: [button[6],button[7],button[8]
]}
const row4 = {
  type: 1,
  components: [button[9]]
}
 
function display() {
  getmsg(msg, messages[0]).then(msg => {
    msg.edit({
        embeds: [{
          description: `${playerTurn()}`,
          footer: {
            text: `host ${msg.client.users.cache.get(player.find(obj => obj.label.includes("host")).id).username}`,
            icon_url: TIMER_GIF
          }
        }],
          components : [row1,row2,row3,row4]
    })
  }).then(() => {
    if (bot === true) {
      if (players(turns[0]).id === msg.client.user.id) {
        AIMove().then(move => {
          handleChoice(move)
        })
      }
    }
  })
}

if (msg.deferred == false){
   await msg.deferReply()
};

const message = await msg.channel.send({
  embeds: [{
    description: `${playerTurn()}`,
    footer: {
      text: `host ${msg.client.users.cache.get(player.find(obj => obj.label.includes("host")).id).username}`,
      icon_url: TIMER_GIF
    }
  }],
    components : [row1,row2,row3,row4]
})

messages.push(message.id)
  
if (bot === true) {
  if (players(turns[0]).id === msg.client.user.id) {
    AIMove().then(move => {
      handleChoice(move)
    })
  }
}
  
  const collector = message.createMessageComponentCollector({
    componentType: 'BUTTON',
    time: 20000
  });
  
  collector.on("collect", async (i) => {
    if (!player.some(obj => obj.id == i.user.id)) return i.reply({ content : i18n.__("games.notplayer"), ephemeral: true });
    if (i.user.id === players(turns[0]).id && i.customId != button[9].customId) {
      switch (i.customId) {
        case button[0].customId:
          handleChoice(0)
          break;
        case button[1].customId:
          handleChoice(1)
          break;
        case button[2].customId:
          handleChoice(2)
          break;
        case button[3].customId:
          handleChoice(3)
          break;
        case button[4].customId:
          handleChoice(4)
          break;
        case button[5].customId:
          handleChoice(5)
          break;
        case button[6].customId:
          handleChoice(6)
          break;
        case button[7].customId:
          handleChoice(7)
          break;
        case button[8].customId:
          handleChoice(8)
          break;
      }
      collector.resetTimer();
    } else if (player.some(obj => obj.id === i.user.id) && i.customId === button[9].customId) {
      collector.stop("forfeit")
    } else {
      i.reply({ content : i18n.__mf("games.xoxo.command.ingame.notturn", {
        player: i.user.id }), ephemeral : true })
    }
  });
  
  collector.on("end", (collected, reason) => {
    
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
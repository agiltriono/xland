require('dotenv').config();
const path = require("path")
const { get } = require("./get");
const colorful = require("./color");
const i18n = require("./i18n");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL
}),
  databaseURL: process.env.FIREBASE_DATABASEURL
})
exports.getrole = function (event, name) {
  return event.roles.cache.find(r => r.name.toLowerCase() === name.toLowerCase())
}
exports.embeds = function(content, footer) {
  if (typeof footer == "undefined") {
    return {
      embeds : [{
        description : content,
        color: "#ae4bdc"
      }]
    }
  } else {
    return {
      embeds : [{
        color: "#ae4bdc",
        description : content,
        footer: {
          text: footer.text,
          icon_url: footer.url
        }
      }]
    }
  }
}
exports.ephemeral = function(content, footer) {
  if (typeof footer == "undefined") {
    return {
      embeds : [{
        description : content,
        color: "#ae4bdc"
      }],
      ephemeral: true
    }
  } else {
    return {
      embeds : [{
        color: "#ae4bdc",
        description : content,
        footer: {
          text: footer.text,
          icon_url: footer.url
        }
      }],
      ephemeral: true
    }
  }
}

exports.remove = async function(message, id) {
  try {
    let msg = await message.channel.messages.fetch(id);
    return msg.delete()
  } catch(err) {
    console.error(err)
  }
}

exports.getmsg = async function(msg, id) {
  let e = await msg.channel.messages.fetch(id);
  return e
}

exports.clear = function(content, time) {
  var timer = 0
  if( typeof time != "undefined") {
    timer = time
    return new Promise(resolve => {
       setTimeout(() => {
         resolve(content.delete());
       }, timer);
    });
  } else {
    return new Promise(resolve => {
       setTimeout(() => {
         resolve(content.delete());
       }, timer);
    });
  }
}

exports.numformat = function(num) {
    if(num > 999 && num < 1000000){
        return (num/1000).toFixed(1) + 'K';
    }else if(num > 1000000){
        return (num/1000000).toFixed(1) + 'M';
    }else if(num < 900){
        return num;
    }
}
exports.genId = function (length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
exports.games = class games {
  constructor(name, guild, started) {
    this.game = name;
    this.guild = guild;
    this.started = started;
  }
}
exports.rich = function (e, n) {
  const obj = e.length != 0 ? e[0] : {}
  return Object.assign({},obj,n)
}
exports.timeconvert = function(secs) {
  const hours = Math.floor(secs / (60 * 60));
  const divisor_for_minutes = secs % (60 * 60);
  const minutes = Math.floor(divisor_for_minutes / 60);
  const divisor_for_seconds = divisor_for_minutes % 60;
  const seconds = Math.ceil(divisor_for_seconds);
  return {
    h: hours,
    m: minutes,
    s: seconds
  };
}
exports.color = function (c) {
  // default color #ae4bdc
  if (c == undefined) return "#ae4bdc";
  if (c == "random") return colorful();
}
exports.isNumber = function (char) {
  if (typeof char !== 'string') return false;
  if (char.trim() === '') return false;
  return !isNaN(char);
}
exports.database = admin.database();
exports.DISCORD_TOKEN = process.env.DISCORD_TOKEN;
exports.fdb = process.env.FIREBASE_DATABASEURL;
exports.INVITE_LINK = process.env.INVITE_LINK;
exports.SUPPORT_LINK = process.env.SUPPORT_LINK;
exports.WEBSITE = process.env.WEBSITE;
exports.PREFIX = process.env.PREFIX;
exports.FLICKR_KEY = process.env.FLICKR_KEY;
exports.IMGUR_ID = process.env.IMGUR_ID;
exports.TENOR_KEY = process.env.TENOR_KEY;
exports.GIPHY_KEY = process.env.GIPHY_KEY;
exports.PLAYER_IMAGE = process.env.PLAYER_IMAGE;
exports.PLAYER_BANNER = process.env.PLAYER_BANNER;
exports.TIMER_GIF = process.env.TIMER_GIF;
exports.TIMER_10S = process.env.TIMER_10S;
exports.dev_id = process.env.dev_id;
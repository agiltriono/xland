const express = require("express");
const path = require("path");
const fs = require("fs")
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const ejs = require("ejs");
const bodyParser = require("body-parser");
const { INVITE_LINK, SUPPORT_LINK } = require("./util/util");
const app = express();
const port = 3000;
class Server {
  constructor(client) {
    this.client = client;
    this.init()
  }
  init () {
    var bot = this.client;
    var source = path.join(__dirname, '.', 'server');
    app.use(session({
    	store: new MemoryStore({ checkPeriod: 86400000 }),
    	secret: 38364383738373837362737,
    	resave: false,
    	saveUninitialized: false
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
    	extended: true
    }));
    app.engine('html', ejs.renderFile);
    app.set('view engine', 'html');
    app.use('/', express.static(source));
    function render(res, req, page, data = {}) {
      let pages = page.split(".")[0].replace(/\_/g," ").toUpperCase();
    	const baseData = {
    	  id: bot.id,
    		logo: bot.avatar,
    		name: bot.username,
    		command: bot.command,
    		pageTitle : `${pages.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}`
    	};
    	res.render(path.resolve(`${source}/view/${page}`), Object.assign(baseData, data));
    }
    const pageFolder = fs.readdirSync('./server/view').filter(file => file.endsWith('.ejs') && file != "home.ejs");

    for (const file of pageFolder) {
    	app.get(`/${path.parse(file).name}`, (req, res) => {
      	render(res, req, path.parse(file).base);
      });
    }
    app.get('/', (req, res) => {
    	render(res, req, 'home.ejs');
    });
    app.get('/home', (req, res) => {
    	res.redirect('/');
    });
    app.listen(port, () => console.log(`Server ready, Listening on ${port}`));
  }
}
module.exports = Server
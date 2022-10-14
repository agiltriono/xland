const i18n = require("../util/i18n");
const fs = require("fs");
const path = require("path");
module.exports = {
  name : "ready",
  async execute(client) {
    const directory = path.join(__dirname, "..","commands");
    client.user.setActivity(`Knight of XLAND`, { type: "PLAYING" });
    // command handler
    fs.readdirSync(directory).forEach(child => {
        const commands = fs.readdirSync(`${directory}/${child}/`).filter(files => files.endsWith(".js"));
        for (const file of commands) {
            const cmd = require(`${directory}/${child}/${file}`);
            if (cmd.help && typeof (cmd.help.name) === "string" && typeof (cmd.help.category) === "string") {
                if (client.commands.get(cmd.help.name)) return;
                client.commands.set(cmd.help.name, cmd);
            } else {
                continue;
            }
            if (cmd.help.aliases && typeof (cmd.help.aliases) === "object") {
                cmd.help.aliases.forEach(alias => {
                        if (client.aliases.get(alias)) return;
                    client.aliases.set(alias, cmd.help.name);
                });
            }
        }
    })
    const command = function() {
      i18n.setLocale("en")
      var fields = []
      fs.readdirSync(directory).forEach(category => {
    		const dir = client.commands.filter(obj => obj.help.category.toLowerCase() === category.toLowerCase());
    	  const capitalise = category.charAt(0).toUpperCase() + category.slice(1);
        try {
          if (dir.size != 0) {
        		fields.push({desc: `<h1 class="cat"><b>${capitalise}</b></h1><br><ul>${dir.map(obj => `<li><b>${client.prefix}${obj.help.name} ${obj.help.usage}</b><br>${i18n.__(obj.help.description)}<br>Permissions : </b>${obj.help.permissions.map(perm => `<b>${perm}</b>`).join(", ")}</li>`).join('')}</ul>`});
          }
      	} catch (err) {
      		console.log(err);
      	}
      });
      return fields;
    }
    const robot = {
      id : client.user.id,
      username : client.user.username,
      avatar : client.user.displayAvatarURL({ format : 'png' }),
      command : command()
    }
    const Server = require("../app");
    const app = new Server(robot)
    console.log(`${client.user.username} Running !`)
  }
}
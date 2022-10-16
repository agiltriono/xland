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
    console.log(`${client.user.username} logged in..`)
  }
}

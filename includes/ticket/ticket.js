const fs = require("fs")
const path = require("path")
module.exports = {
  async ticket(interaction, client, args) {
    const files = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && file != "ticket.js");
    const event = require(path.join(__dirname, files[files.findIndex(n=> n === args[0]+".js")]))
    return event.execute(interaction, client, args);
  }
}
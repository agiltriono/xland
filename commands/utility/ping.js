// Check mesaage latency and API response
const { embeds } = require(".././../util/util");
const i18n = require(".././../util/i18n");

module.exports.help = {
  name: "ping",
  aliases: ["ping-pong"],
  usage: "",
  cooldown: 3,
  category: "Utility",
  permissions: ["ADMINISTRATOR"],
  description: "utility.ping.description"
}
module.exports.run = async (msg, args) => {
  try {
    
    const m = await msg.reply(embeds("..."))
    
    const ping = Math.round(m.createdTimestamp - msg.createdTimestamp);
    
    return m.edit(embeds(`:green_circle: Latency ${'..'.repeat(Math.ceil(ping / 100))} \`${ping}ms\`\n:green_circle: Api ${'..'.repeat(Math.ceil(Math.round(msg.client.ws.ping) / 100))} \`${Math.round(m.client.ws.ping)}ms\``));
		
  } catch (error) {
    console.log(error)
  }
}
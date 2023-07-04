module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    const go  = (name, filepath, args) => {
      return require(`.././../includes/${filepath}`)[name](interaction, client, args)
    }
    const helper = (string) => {
      let arg = string.split('_')
      return arg[0]
    }
    if (interaction.isButton()) {
      if (interaction.message.partial) {
        try {
          await interaction.message.fetch()
        } catch (error) {
          interaction.reply({
            content: "something went wrong !",
            ephemeral: true
          })
        }
      }
      if (interaction.customId.includes("vc_interface_")) return go("voice", "voice/voice", interaction.customId.replace("vc_interface_", ""));
      if (interaction.customId.includes("buat_channel_")) return go("textchannel", "textchannel/textchannel", interaction.customId.replace("buat_channel_", ""));
      if (interaction.customId.includes("open_ticket_") || interaction.customId.includes("close_ticket_") || interaction.customId.includes("delete_ticket_")) return go("ticket", "ticket/ticket", interaction.customId.split("_"));
      if (interaction.customId.includes("upvote_") || interaction.customId.includes("downvote_")) return go("suggestion", "suggestion/suggestion", interaction.customId.split("_"));
    }
    if (interaction.isSelectMenu()) {
      if (interaction.message.partial) {
        try {
          await interaction.message.fetch()
        } catch (error) {
          interaction.reply({
            content: "something went wrong !",
            ephemeral: true
          })
        }
      }
      if (interaction.customId.includes('vc_selectmenu_')) return go("voice", "voice/voice", helper(interaction.customId.replace("vc_selectmenu_", '')));
    }
    if (interaction.isModalSubmit()) {
      if (interaction.message.partial) {
        try {
          await interaction.message.fetch()
        } catch (error) {
          interaction.reply({
            content: "something went wrong !",
            ephemeral: true
          })
        }
      }
      if (interaction.customId.includes('vc_modal_')) return go("voice", "voice/voice", interaction.customId.replace("vc_modal_", ''));
    }
  }
}
module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    const go  = (name) => {
      return require(`../includes/${name}`)[name](interaction, client)
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
      go("isButton");
    }
  }
}
module.exports = {
  name : "messageReactionAdd",
  async execute(reaction, user, client) {
    if (reaction.partial) {
  		try {
  			await reaction.fetch();
  		} catch (error) {
  			return;
  		}
  	}
  	if (reaction.message.embeds.length) {
  	  if (reaction.message.embeds[0].fields.length) {
  	    const fields = reaction.message.embeds[0].fields;
  	    fields.forEach(async field => {
  	      const emo = field.name.replace("> ", "");
  	      const role = field.value.replace(/[\\<>@#&!]/g, "");
  	      if (reaction.emoji.name != emo) return;
  	      if (reaction.emoji.name === emo) {
  	        if(reaction.message.author.id === user.id) return;
  	        const member = await reaction.message.guild.members.fetch(user.id)
  	        if (!member.roles.cache.has(role)) {
  	          await member.roles.add(role)
  	        } else {
  	          return;
  	        }
  	      }
  	    })
  	  }
  	}
  }
}
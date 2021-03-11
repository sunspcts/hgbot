const Discord = require('discord.js')

exports.help = (message) => { //todo: make this automatic
		embed = new Discord.MessageEmbed()
		.setColor('#000000')
		.setTitle('Help')
		.addField("Setup Game", "hg!setup")
		.addField("Reset Game", "hg!reset")
		.addField("Start Game", "hg!start")
		.addField("Next Round", "hg!next")
		message.channel.send(embed)
}
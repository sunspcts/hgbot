// load essential modules
const Discord = require('discord.js')
const client = new Discord.Client();
const setup = require('./modules/setup');
const helpjs = require('./modules/help');
const game = require('./modules/game');
const Enmap = require('enmap');

//db to store running games
client.currentGames = new Enmap ({
	name: "currentgames",
	fetchAll: false,
	autoFetch: true,
	cloneLevel: 'deep',
	autoEnsure: {
		inSetup: false,
		inGame: false,
		day: 0,
		chosen: false,
		isDay: true, //true=day, false=night
		onSpecialDay: false,
		doneSpecialDay: false,
		initialTributes: [],
		currentTributes: [],
		dead: [],
	}
});

const config = require("./config.json"); //contains prefix and token


client.on('ready', () => {
	console.log('bot online!');
	client.user.setActivity('The Hunger Games', { type: 'PLAYING' }); 
});

client.on('message', message => {
	if (message.author.bot) return;

	if (!message.content.startsWith(prefix)) return;
	 //take away prefix
	const args = message.content.slice(prefix.length).split(/ +/);
	
	// make the command lowercase
	const cmdName = args.shift().toLowerCase();
	
	try {
		switch(cmdName) {
			case "setup":
				setup.startsetup(message, client); break;
			case "help":
				helpjs.help(message); break;
			case "reset":
				setup.reset(message, client); break;
			case "uploadtributes":
			case "addtribute":
				if(client.currentGames.get(message.guild.id, "chosen")) message.channel.send("Setup already complete!");
				if(!client.currentGames.get(message.guild.id, "inSetup")) message.channel.send(`Run ${config.prefix}setup first!`); 
				break;
			case "start":
				if(!client.currentGames.get(message.guild.id, "inGame") && client.currentGames.get(message.guild.id, "chosen")) {
					game.start(message, client) //HERE WE GO
				}
				else if(client.currentGames.get(message.guild.id, "inGame")) console.log("Game already running, use hg!next.")
				break;
			case "next":
				if(client.currentGames.get(message.guild.id, "inGame")) {
					game.next(message, client) //HERE WE GO
				}
				else if (!client.currentGames.get(message.guild.id, "inGame")) console.log("No game found. Please run hg!setup or hg!start.")
				break;
		}
		if(client.currentGames.get(message.guild.id, "inSetup")) setup.chooseTributes(message, client);
	} catch (error) {
		console.error(error);
		message.channel.send("err")
		//message.reply('something went wrong, but idk what. message my creator, sunspcts#0505 with a screenshot of what you were doing so they can try to fix it');
	}
});

client.login(config.token)
// load essential modules
const Discord = require('discord.js')
const client = new Discord.Client();
const setup = require('./modules/setup');
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
  }
});

const config = require("./config.json") //contains prefix and token

prefix = config.prefix


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
		if (cmdName === "setup") {
			setup.startsetup(message, client)
		}
		if (cmdName === "reset") {
			setup.reset(message, client)
		}
		//this is bad code
		if (cmdName === "addtribute" || cmdName === "uploadtributes") {
			if(client.currentGames.get(message.guild.id, "chosen")) {
				message.channel.send("Setup already complete!");
			}
		}
		console.log(client.currentGames.get(message.guild.id, "chosen"))
		if (!client.currentGames.get(message.guild.id, "chosen")) {
			if(client.currentGames.get(message.guild.id, "inSetup")) setup.chooseTributes(message, client);
			else if (cmdName === "addtribute") message.channel.send(`Run ${config.prefix}setup first!`)
		}
		else {
			console.log("yote")
			console.log(cmdName)
			if (cmdName === "start" && !client.currentGames.get(message.guild.id, "inGame") && client.currentGames.get(message.guild.id, "chosen")) { //HERE WE GO
				console.log("yeetus")
				game.start(message, client)
			}
		}
  } catch (error) {
  	console.error(error);
	  message.channel.send("bot did an oopsie")
  	//message.reply('something went wrong, but idk what. message my creator, sunspcts#0505 with a screenshot of what you were doing so they can try to fix it');
  }
});

client.login(config.token)
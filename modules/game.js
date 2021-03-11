const fs = require('fs');
const Discord = require('discord.js');
const parser = require('./parser.js');
exports.start = (message, client) => {
	const _guild = message.guild.id
	const db = client.currentGames

	db.set(_guild, true, "inGame");
	db.set(_guild, 0, "day");

	var events = eventRound('events/bloodbathevents.json', _guild, db);

	let roundEmbed = new Discord.MessageEmbed().setColor('#fa0000').setTitle('**The Bloodbath**').setDescription('The game begins.');
	for (let i = 0; i < events.length; i += 2) {
			if(i + 1 < events.length)
				roundEmbed.addField('\u200b\n**' + events[i].string + '**', '\u200b\n**' + events[i + 1].string + '**', true);
			else
				roundEmbed.addField('\u200b\n**' + events[i].string + '**', '\u200b', true);
	}
	message.channel.send(roundEmbed)
	db.set(_guild, true, "isDay");
	db.set(_guild, 1, "day");
}
exports.next = (message, client) => {
	const _guild = message.guild.id
	const db = client.currentGames

	let isDay = db.get(_guild, "isDay")
	let day = db.get(_guild, "day")
	let dead = db.get(_guild, "dead")
	let roundEmbed = new Discord.MessageEmbed().setColor(isDay ? '#ff05c1' : '#5d0873').setTitle('**Day ' + Math.floor(day) + '**').setDescription(isDay ? '**Daytime**' : '**Nighttime**');

	if(dead.length > 0 && isDay){ // F in the Chat!
		message.channel.send(cannonShots(db, _guild));
	}
	else {
		events = eventRound(isDay ? "events/events.json" : "events/nightevents.json", _guild, db);
		roundEmbed.setThumbnail(isDay ? 'https://raw.githubusercontent.com/Corvance/tpshgbot/main/day.png' : 'https://raw.githubusercontent.com/Corvance/tpshgbot/main/night.png'); //TODO: Remove Corv's assets
		for (let i = 0; i < events.length; i += 2) {
			if(i + 1 < events.length)
				roundEmbed.addField('\u200b\n**' + events[i].string + '**', '\u200b\n**' + events[i + 1].string + '**', true);
			else
				roundEmbed.addField('\u200b\n**' + events[i].string + '**', '\u200b', true);
		}
		message.channel.send(roundEmbed);
		db.set(_guild, !isDay, "isDay")
		db.math(_guild, "+", 0.5, "day")
	}
}
//the ultraFunction
function eventRound(eventsPath, _guild, db) {
	
		let raw = fs.readFileSync(eventsPath);
		let events = JSON.parse(raw).events;
		let currentTributes = db.get(_guild, "currentTributes");
		//copy currentTributes to tempTributes
		tempTributes = [...currentTributes]
		//Array of all the events which take place this round
		let eventsThisRound = [];

		while (tempTributes.length > 0) {  

			// shuffle that mf up
			tempTributes = shuffleArray(tempTributes);
	
			//Get sub-array of first 5 elements after shuffled
			let thisEventTributes = [];
			thisEventTributes = tempTributes.splice(0, 4);

			let event;
			do {
				event = events[Math.floor(Math.random() * events.length)]; //self-explanatory, random event
				event = JSON.parse(JSON.stringify(event))
	
			} while (event.numTributes > thisEventTributes.length || (event.deaths.length >= currentTributes.length && event.deaths[0] !== -1));
			//format that shit
			event = parser.parseEvent(event, thisEventTributes); 
			//Push the event to the array for returning
			console.log(event);
			eventsThisRound.push(event);
			//genocide
			for (let j = 0; j < thisEventTributes.length; j++) {
				//check if their index is included in the deaths array of the tribute object,
				if (event.deaths.indexOf(j) >= 0) {
					console.log(`guild ${_guild}: ${thisEventTributes[j].name} Dies`)
					db.push(_guild, thisEventTributes[j], "dead");
					//remove them
					currentTributes.splice(currentTributes.indexOf(thisEventTributes[j]), 1);
					db.set(_guild, currentTributes, "currentTributes")
				}
			}
			event = [];
		}
	
		return eventsThisRound;
	}
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

function cannonShots(db, _guild) {
	db.set(_guild, [], "dead")
	return "wip";
}
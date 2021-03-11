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

	if(dead.length > 0 && isDay){ //F
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
		
		events = killEvents(events, db.get(_guild, "initialTributes").length, currentTributes.length);

		while (tempTributes.length > 0) {  

			// shuffle that mf up
			tempTributes = shuffleArray(tempTributes);
	
			//Get sub-array of first 5 elements after shuffled
			let thisEventTributes = [];
			thisEventTributes = tempTributes.splice(0, 4);


			let event;
			do {
				event = events[Math.floor(Math.random() * events.length)];
				event = JSON.parse(JSON.stringify(event))
	
			} while (event.numTributes > thisEventTributes.length || (event.deaths.length >= currentTributes.length && event.deaths[0] !== -1));
			
			event = parser.parseEvent(event, thisEventTributes);  //add tribute name and correct pronouns to event string

			//Push the event to the array for returning
			eventsThisRound.push(event);

			//kill the tributes that died
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
	dead = db.get(_guild, "dead")
	let day = db.get(_guild, "day")
	let deadEmbed = new Discord.MessageEmbed().setTitle('**The Dead**').setDescription('Cannon shots can be heard in the distance...');
  for(let i = 0; i < dead.length; i++){
    deadEmbed.addField('**' + dead[i].name + '**', `Day ${day}`);
	};
	db.set(_guild, [], "dead");
	return deadEmbed;
}

function killEvents(events, initialLength, currentLength) {
	newEvents = JSON.parse(JSON.stringify(events))
	const eventLength = newEvents.length; // stops an infinite loop
	for (i = 0; i < eventLength; i++) {
		let rand = Math.random();
		let j = currentLength/initialLength;
		if(newEvents[i].deaths[0] != -1) {
			console.log(rand + "   " + j);
			if(j < rand * 2) {console.log("added"); newEvents.push(newEvents[i])};
		}
		console.log(i)
	}
	return(newEvents);
}
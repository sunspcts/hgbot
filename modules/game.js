const fs = require('fs');
const Discord = require('discord.js');
const parser = require('./parser.js');
exports.start = (message, client) => {
    console.log("yeet")
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

}

//the ultraFunction
function eventRound(eventsPath, _guild, db) {


    let raw = fs.readFileSync(eventsPath);
    let events = JSON.parse(raw).events;
    let currentTributes = db.get(_guild, "currentTributes");
    //copy currentTributes to tempTributes
    tempTributes = currentTributes
  
    //Array of all the events which take place this round
    let eventsThisRound = [];

    while (tempTributes.length > 0) {  

      // shuffle that mf up
      tempTributes = shuffleArray(tempTributes);
  
      //Get sub-array of first 5 elements after shuffled
      //This is because the maximum no. of tributes in one event is 5 (including the main tribute for that event choice)
      //If this changes, just change the second parameter of splice()
      let thisEventTributes = [];
      thisEventTributes = tempTributes.splice(0, 4);
      
      //Randomly pick an event until one which can be done with the current no. of remaining tributes is picked
      if(tempTributes.length < 4){
        for(let i = 0; i <= events.length - 1; i++){
          if(events[i].deaths[0] !== -1){
          }
        }
        //events.concat(deathRepeats.slice(0,deathRepeats.length));
      }

      let event;
      do {
        event = events[Math.floor(Math.random() * events.length)]; //self-explanatory, random event
  
      } while (event.numTributes > thisEventTributes.length || (event.deaths.length >= currentTributes.length && event.deaths[0] !== -1));

      //Format the string to include all the relevant names, pronouns and verb forms
      //Also adds all tributes in thisEventTributes who went unused back to tempTributes so they can have their own events
      event = parser.parseEvent(event, thisEventTributes); //removing this temporarily
      //Push the event to the cumulative array for returning
      eventsThisRound.push(event);
  
      //Kill everyone who needs to die
      for (let j = 0; j < thisEventTributes.length; j++) {
        //If their index is included in the deaths array of the tribute object
        if (event.deaths.indexOf(j) >= 0) {
          
          //Push them to the dead array so they can be show in the cannon shots
          dead.push(thisEventTributes[j]);
          //Remove the dead peeps from currentTributes so they don't suddenly come back to life in the next round
          var currentTributes_new = currentTributes.slice(currentTributes.indexOf(thisEventTributes[j]), 1);
          db.set(_guild, currentTributes_new, "currentTributes")
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

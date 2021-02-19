const config = require("../config.json")
const Discord = require('discord.js')
const fs = require('fs');
const fetch = require('node-fetch');


exports.startsetup = (message, client) => {
    const _guild = message.guild.id
    if (client.currentGames.get(_guild, "inSetup")) {message.channel.send("Game already set up, or is currently in the setup process. Run hg!reset to start a new game."); return;};
    setupID = message.author.id;
    client.currentGames.set(_guild, setupID, "gameMaster");
    client.currentGames.set(_guild, true, "inSetup");
    let setupEmbed = new Discord.MessageEmbed().setColor('#ff05c1').setTitle('Setup').setDescription('You can now add tributes using hg!addtribute, upload a premade tributes file using hg!uploadtributes, export a tributes file using hg!exporttributes, finish setup using hg!finishsetup or cancel by using hg!quit.');
    message.channel.send(setupEmbed);
    
}
exports.reset = (message, client) => {
    client.currentGames.delete(message.guild.id);
    message.channel.send("Reset!")
}

exports.chooseTributes = (msg, client) => {
  const _guild = msg.guild.id
  //Setup exit command
  if (msg.content.toLowerCase() === config.prefix + 'quit') {
    client.currentGames.set(_guild, false, "inSetup");
    return;
  }
  else {
    if (msg.content.startsWith(`${config.prefix}addtribute`) ) {
      if(validTribute(msg.content) === true) {
        let string = msg.content.replace(/\s+/g, '');
        split = string.slice(prefix.length+10).split(",");
        client.currentGames.push(_guild, {name : split[0], gender : parseInt(split[1])}, "initialTributes");
        msg.react('👍')
      }
      else {
        msg.channel.send(`Tributes must be given in the form of "<name>, <gender>." Gender should be provided as a number, a value of 0 being male, 1 being female, and 2 being non-binary/other. For example, \`hg!addtribute Averie, 1\` would add a female tribute called Averie.`)
      }
    }
    else if (msg.content.startsWith(`${config.prefix}uploadtributes`)) {
      try { var Attachment = (msg.attachments).array();
      let settings = { method: "Get" };
      let url = Attachment[0].url
      fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
          try {for (i = 0; i < json.tributes.length; i++) {

            console.log(parseInt(json.tributes[i].gender));
            if(typeof json.tributes[i].name === 'string' && typeof parseInt(json.tributes[i].gender) === 'number') {  
              client.currentGames.push(_guild, {name: json.tributes[i].name, gender: parseInt(json.tributes[i].gender)}, "initialTributes");
            }
          }}
          catch {msg.channel.send("Invalid, input must be a valid JSON file.")}
        })
      }
      catch {
      msg.channel.send("Invalid, input must be a valid JSON file.") 
      }
    } 
    else if (msg.content.startsWith(`${config.prefix}exporttributes`)) {
      console.log(client.currentGames.get(_guild, "initialTributes"));
      let tributes = client.currentGames.get(_guild, "initialTributes")
      let tributes2 = {tributes}
      file = JSON.stringify(tributes2);
      attachment = new Discord.MessageAttachment(Buffer.from(file, 'utf-8'), 'tributes');
      msg.channel.send(attachment)
    }
    if (msg.content.startsWith(`${config.prefix}finishsetup`)) {
      let initTribs = client.currentGames.get(_guild, "initialTributes");
      if(initTribs.length % 2 === 0) {
        client.currentGames.set(_guild, initTribs, "currentTributes");
        client.currentGames.set(_guild, true, "chosen");
        msg.channel.send("Success! Now you can run sg!start! (TODO: MAKE THIS AN EMBED)")
        return;
      }
      msg.channel.send("Err: Number of tributes must be a multiple of 2");
      console.log(initTribs);
    }
  }
}
function validTribute(string) {
  string = string.replace(/\s+/g, '');
  split = string.slice(prefix.length+10).split(",");
  
  if(typeof split[0] === 'string' && typeof parseInt(split[1]) === 'number') {
    if(split[1] < 3) {
      return true;
    }
    else return false;
  }
  else return false;
}
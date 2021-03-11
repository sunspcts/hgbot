const pronouns = [['He', 'Him', 'His'], ['She', 'Her', 'Her'], ['They', 'Them', 'Their']];

exports.parseEvent = (event, tributes) => {	
	//Loop through each tribute
	for (let i = 0; i < event.numTributes; i++) {
		while (event.string.includes('<tribute' + i + '>')) {
			//Replace all occurences of this tribute's index with their name  
			event.string = event.string.replace('<tribute' + i + '>', tributes[i].name);
		}
		//Replace all occurences of pronouns with those corresponding to this tribute
		while (event.string.includes('<heshethey' + i + '>')) {
			event.string = event.string.replace('<heshethey' + i + '>', pronouns[tributes[i].gender][0].toLowerCase());
		}
		while (event.string.includes('<himherthem' + i + '>')) {
			event.string = event.string.replace('<himherthem' + i + '>', pronouns[tributes[i].gender][1].toLowerCase());
		}
		while (event.string.includes('<hishertheir' + i + '>')) {
			event.string = event.string.replace('<hishertheir' + i + '>', pronouns[tributes[i].gender][2].toLowerCase());
		}
		while (event.string.includes('<isare' + i + '>')) {
      if (tributes[i].gender < 3)
        event.string = event.string.replace('<isare' + i + '>', 'is');
      else
        event.string = event.string.replace('<isare' + i + '>', 'are');
    }
	}
	tempTributes = tempTributes.concat(tributes.splice(event.numTributes, tributes.length - event.numTributes));
	return event;
}
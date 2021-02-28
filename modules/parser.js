exports.parseEvent = (event, tributes) => {
    tempTributes = tempTributes.concat(tributes.splice(event.numTributes, tributes.length - event.numTributes));
    return event;
}
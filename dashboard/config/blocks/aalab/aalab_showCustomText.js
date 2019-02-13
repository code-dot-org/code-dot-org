function showCustomText(text, location, size, color, duration) {
  var overlapIndex = -1;
  for(var i = 0; i < customText.length && overlapIndex < 0; i++) {
    if(customText[i].location.x === location.x && customText[i].location.y === location.y) {
      overlapIndex = i;
    }
  }
  if(overlapIndex > 0) {
    customText.splice(overlapIndex, 1);
  }
  customText.push({text: text, location: location, size: size, color: color, duration: parseInt(duration) * 1000, timeStarted: new Date().getTime()});
}
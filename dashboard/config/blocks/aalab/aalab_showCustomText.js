function showCustomText(text, location, size, color, duration) {
  testText = text ? text() : "";
  location = location ? location : {x: 200, y: 200};
  size = size ? size : 25;
  color = color ? color : "black";
  var overlapIndex = -1;
  textSize(size);
  var newTextWidth = textWidth(testText);
  var newTextHeight = textLeading();
  for(var i = 0; i < customText.length && overlapIndex < 0; i++) {
    textSize(customText[i].size);
    var customTextWidth = textWidth(customText[i].text());
    var customTextHeight = textLeading();
    var overlapping = checkTextOverlap(location, newTextWidth, newTextHeight, customText[i].location, customTextWidth, customTextHeight);
    if(overlapping && duration * 1000 == customText[i].duration) {
      overlapIndex = i;
    }
  }
  if(overlapIndex >= 0) {
    customText.splice(overlapIndex, 1);
  }
  customText.push({text: text, location: location, size: size, color: color, duration: parseInt(duration) * 1000, timeStarted: new Date().getTime()});
}

// Classic algorithm
function checkTextOverlap(topLeftPointA, widthA, heightA, topLeftPointB, widthB, heightB) {
  var bottomRightPointA = {
    x: topLeftPointA.x + widthA,
    y: topLeftPointA.y + heightA
  };
  var bottomRightPointB = {
    x: topLeftPointB.x + widthB,
    y: topLeftPointB.y + heightB
  };
  // check if one text is above the other (first two) 
  // or if one text is to the left of the other (last two)
  if(bottomRightPointA.y < topLeftPointB.y ||
     bottomRightPointB.y < topLeftPointA.y ||
     bottomRightPointA.x < topLeftPointB.x ||
     bottomRightPointB.x < topLeftPointA.x) {
  	return false;
  }
  return true;
}
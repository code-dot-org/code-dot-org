function speakerSaysConsole(sprite, message) {
  var speaker;
  if(!sprite) {
    speaker = "Code.org";
  } else {
    speaker = sprite.name;
  }
  console.log(speaker + " says: " + message);
}
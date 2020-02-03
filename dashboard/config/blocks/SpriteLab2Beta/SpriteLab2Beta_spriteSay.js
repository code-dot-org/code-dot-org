function spriteSay(sprite, text, seconds) {
  if(!sprite.textBox || Object.keys(sprite.textBox).length === 0) {
    text = " " + text + " ";
    sprite.textBox = {
      x: 0,
      y: 0,
      width: textWidth(text),
      height: textSize() + 4,
      text: text,
      seconds: seconds,
      timerStarted: false
    };
  }
}
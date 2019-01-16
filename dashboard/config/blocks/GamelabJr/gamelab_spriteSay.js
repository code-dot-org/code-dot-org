function spriteSay(sprite, text) {
  sprite_says.push({sprite: sprite, txt: text, time: millis() + 2000});
}
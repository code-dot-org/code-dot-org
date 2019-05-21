var spriteId = 0;
var nativeSpriteMap = {};

export const commands = {
  setBackground(color) {
    this.background(color);
  },

  makeSprite(animation, location) {
    var sprite = this.createSprite(location.x, location.y);
    nativeSpriteMap[spriteId] = sprite;
    sprite.id = spriteId;
    if (animation) {
      sprite.setAnimation(animation);
    }
    spriteId++;
    return sprite.id;
  }
};

// ******** HELPER FUNCTION TO GET RELATIVE SCALE PER BRANDING GUIDELINES ********
function getDefaultSpriteScale(costume) {
  return defaultSpriteScales[costume] || 100;
}

// ******** COMMAND OVERRIDES FOR EXISTING SPRITE LAB BLOCKS ********
function makeNewSpriteAnon(costume, location) {
  createNewSprite({name: 'newTransformersSprite'}, costume, location);
  var size = getDefaultSpriteScale(costume);
  setProp({name: 'newTransformersSprite'}, "scale", size);
}
function makeNumSprites(count, costume) {
  for (var i = 0; i < count; i++) {
    createNewSprite(
      {name: 'newTransformersSprite'},
      costume,
      randomLocation()
    );
    var size = getDefaultSpriteScale(costume);
    setProp({name: 'newTransformersSprite'}, "scale", size);
  }
}
function setAnimation(spriteArg, costume) {
  // Only compatible with sprite costumes. Does not work for named sprites.
  if (!spriteArg.costume) {
    return;
  }
  var sprites = World.allSprites;
  var filteredSprites = [];
  // Get all sprites of the selected costume
  for (var i = 0; i < allSprites.length; i++) {
    if (allSprites[i].getAnimationLabel() === spriteArg.costume) {
      filteredSprites.push(allSprites[i]);
    }
  }
  for (var j = 0; j < filteredSprites.length; j++) {
    var sprite = filteredSprites[j];
    var currentSize = sprite.getScale() * 100;
    var currentCostumeDefaultSize = getDefaultSpriteScale(sprite.getAnimationLabel());
    var currentScaleFactor = currentSize / currentCostumeDefaultSize;
    var newCostumeDefaultSize = getDefaultSpriteScale(costume);
    var newSize = newCostumeDefaultSize * currentScaleFactor;
    // Adjust the size of the sprite based on branding guidelines.
    sprite.setScale(newSize / 100);
    // Remaining code follows implementation from p5lab/spritelab/commands/spriteCommands.js
    sprite.setAnimation(costume);
    sprite.scale /= sprite.baseScale;
    sprite.baseScale =
      100 /
      Math.max(
      100,
      sprite.animation.getHeight(),
      sprite.animation.getWidth()
    );
    sprite.scale *= sprite.baseScale;
  }
}

// ******** HELPER CODE FOR CUSTOM BLOCKS ********
// https://levelbuilder-studio.code.org/pools/transformers/blocks
function setTransformersSize(spriteArg, scale) {
  if(!scale) {
    scale = Math.random() * 2;
  }

  var defaultSize = getDefaultSpriteScale(spriteArg.costume);
  var size = scale * defaultSize;

  setProp(spriteArg, 'scale', size);
}
function setAllTransformersSize(scale) {
  // setTransformersSize({costume: 'all'}, value);
  var sprites = World.allSprites;
  for (var i = 0; i < sprites.length; i++) {
    var sprite = sprites[i];
    var defaultSize = getDefaultSpriteScale(sprite.getAnimationLabel());
    var size = (defaultSize / 100) * scale;
    sprite.setScale(size);
  }
}
function playSoundOptions(choice){
  playSound(choice);
}


// ******** CRITERION COMMAND ********
// Level 8 - Check that a sprite was resized.
function validateSpriteScaleChanged(){
  var sprites = World.allSprites;
  for (var i = 0; i < sprites.length; i++) {
    var defaultScale = getDefaultSpriteScale(sprites[i].getAnimationLabel()) / 100;
    var actualScale = sprites[i].getScale();
    if(actualScale !== defaultScale) {
      return true;
    }
  }
  return false;
}

var defaultSpriteScales = {
  'bumblebee_1': 220,
  'bumblebee_2': 200,
  'bumblebee_3': 220,
  'bumblebee_4': 218,
  'bumblebee_vehicle': 225,
  'elita_1': 215,
  'elita_2': 205,
  'elita_3': 175,
  'elita_4': 205,
  'elita_vehicle': 200,
  'megatron_1': 295,
  'megatron_2': 240,
  'megatron_3': 270,
  'megatron_4': 295,
  'megatron_vehicle': 248,
  'optimus_prime_1': 250,
  'optimus_prime_2': 207,
  'optimus_prime_3': 213,
  'optimus_prime_4': 217,
  'optimus_prime_vehicle': 205,
  'cog': 48
};
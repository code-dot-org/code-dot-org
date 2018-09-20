
function makeNewDanceSprite(costume, name, location) {
  
  if (SPRITE_NAMES.indexOf(costume) < 0) {
    costume = SPRITE_NAMES[0];
  }
  
  if (!location) {
    location = {x: 200, y: 200};
  }

  var sprite = createSprite(location.x, location.y);

  sprite.style = costume;
  if (!sprites_by_type.hasOwnProperty(costume)) {
    sprites_by_type[costume] = createGroup();
  }
  sprites_by_type[costume].add(sprite);
 
  sprite.mirroring = 1;
  sprite.looping_move = 0;
  sprite.looping_frame = 0;
  sprite.current_move = 0;
  sprite.previous_move = 0;
  
  for (var i=0; i < ANIMATIONS[costume].length; i++) {
    sprite.addAnimation("anim" + i, ANIMATIONS[costume][i].animation);
  }

  // ToDo - fix setting rest at start
  sprite.changeAnimation("anim8");
  sprite.current_move = 8;
  
  sprite.animation.stop();
  sprites.add(sprite);
  sprite.speed = 10;
  sprite.sinceLastFrame = 0;
  sprite.dance_speed = 1;
  sprite.previous_speed = 1;
  sprite.behaviors = [];

  // Add behavior to control animation
  addBehavior(sprite, function() {
    var delta = 1 / (frameRate() + 0.01) * 1000;
    sprite.sinceLastFrame += delta;
    var msPerBeat = 60 * 1000 / (song_meta.bpm * (sprite.dance_speed / 2));
    var msPerFrame = msPerBeat / FRAMES;
    while (sprite.sinceLastFrame > msPerFrame) {
      sprite.sinceLastFrame -= msPerFrame;
      sprite.looping_frame++;
      if (sprite.animation.looping) {
        sprite.animation.changeFrame(sprite.looping_frame % sprite.animation.images.length);
      } else {
        sprite.animation.nextFrame();
      }
      
      if (sprite.looping_frame % FRAMES === 0) {
        if (ANIMATIONS[sprite.style][sprite.current_move].mirror) sprite.mirroring *= -1;
        if (sprite.animation.looping) {
          sprite.mirrorX(sprite.mirroring);
        }
      }
      
      var currentFrame = sprite.animation.getFrame();
      if (currentFrame === sprite.animation.getLastFrame() && !sprite.animation.looping) {
        //changeMoveLR(sprite, sprite.current_move, sprite.mirroring);
        sprite.changeAnimation("anim" + sprite.current_move);
        sprite.animation.changeFrame(sprite.looping_frame % sprite.animation.images.length);
        sprite.mirrorX(sprite.mirroring);
        sprite.animation.looping = true;
      }
    }
  });

  sprite.setTint = function (color) {
    sprite.tint = color;
  };
  sprite.removeTint = function () {
    sprite.tint = null;
  };

  sprite.setPosition = function (position) {
    if (position === "random") {
      sprite.x = randomNumber(50, 350);
      sprite.y = randomNumber(50, 350);
    } else {
      sprite.x = position.x;
      sprite.y = position.y;
    }
  };
  sprite.setScale = function (scale) {
    sprite.scale = scale;
  };
  return sprite;
}
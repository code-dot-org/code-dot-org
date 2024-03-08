var GRID_SIZE = 8;
var CELL_SIZE = 400 / GRID_SIZE;
var GRAVITY = -0.25;

setDefaultSpriteSize(CELL_SIZE);

// Handles sprite interactions every frame.
function gameDevLoop() {
  collide('collide', {group: 'players'}, {group: 'walls'});
  collide('collide', {group: 'objects'}, {group: 'walls'});
  collide('collide', {group: 'enemies'}, {group: 'walls'});
  edgesCollide({group: 'players'});
  edgesCollide({group: 'enemies'});
  edgesCollide({group: 'objects'});
  gravity({group: 'players'}, GRAVITY);
  gravity({group: 'enemies'}, GRAVITY);
//  addBehaviorSimple({group: 'players'}, new Behavior(movingLeftAndRight, []));
}

// A behavior to make a sprite move left and right with arrow keys.
// function movingLeftAndRight(this_sprite) {
//  if (isKeyPressed('left') || isKeyPressed('a')) {
//    moveInDirection(this_sprite, getProp(this_sprite, 'speed'), 'West');
//  }
//  if (isKeyPressed('right') || isKeyPressed('d')) {
//    moveInDirection(this_sprite, getProp(this_sprite, 'speed'), 'East');
//  }
//}

other.push(gameDevLoop);
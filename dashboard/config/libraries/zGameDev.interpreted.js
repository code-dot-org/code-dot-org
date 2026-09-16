var GRID_SIZE = 8;
var CELL_SIZE = 400 / GRID_SIZE;
var GRAVITY = -0.75;

setDefaultSpriteSize(CELL_SIZE);

// Handles sprite interactions every frame.
function gameDevLoop() {
  collide('collide', {group: 'players'}, {group: 'walls'});
  collide('collide', {group: ''}, {group: 'walls'});

  edgesCollide({group: 'players'});
  gravity({group: 'players'}, GRAVITY);
}

other.push(gameDevLoop);
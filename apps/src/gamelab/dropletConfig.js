var msg = require('./locale');
var api = require('./apiJavascript.js');
var showAssetManager = require('../assetManagement/show');
var getAssetDropdown = require('../assetManagement/getAssetDropdown');

var COLOR_LIGHT_GREEN = '#D3E965';
var COLOR_BLUE = '#19C3E1';
var COLOR_RED = '#F78183';
var COLOR_CYAN = '#4DD0E1';
var COLOR_YELLOW = '#FFF176';
var COLOR_PINK = '#F57AC6';
var COLOR_PURPLE = '#BB77C7';
var COLOR_GREEN = '#68D995';
var COLOR_WHITE = '#FFFFFF';
var COLOR_BLUE = '#64B5F6';
var COLOR_ORANGE = '#FFB74D';

var GameLab;

exports.injectGameLab = function (gamelab) {
  GameLab = gamelab;
};

// Flip the argument order so we can bind `typeFilter`.
function chooseAsset(typeFilter, callback) {
  showAssetManager(callback, typeFilter);
}

module.exports.blocks = [
  // Game Lab
  {func: 'loadImage', category: 'Game Lab', paletteParams: ['url'], params: ['"https://code.org/images/logo.png"'], type: 'either', dropdown: { 0: function () { return getAssetDropdown('image'); } }, assetTooltip: { 0: chooseAsset.bind(null, 'image') } },
  {func: 'var img = loadImage', category: 'Game Lab', paletteParams: ['url'], params: ['"https://code.org/images/logo.png"'], noAutocomplete: true },
  {func: 'image', category: 'Game Lab', paletteParams: ['image','srcX','srcY','srcW','srcH','x','y','w','h'], params: ["img", "0", "0", "img.width", "img.height", "0", "0", "img.width", "img.height"] },
  {func: 'fill', category: 'Game Lab', paletteParams: ['color'], params: ["'yellow'"] },
  {func: 'noFill', category: 'Game Lab' },
  {func: 'stroke', category: 'Game Lab', paletteParams: ['color'], params: ["'blue'"] },
  {func: 'noStroke', category: 'Game Lab' },
  {func: 'arc', category: 'Game Lab', paletteParams: ['x','y','w','h','start','stop'], params: ["0", "0", "800", "800", "0", "HALF_PI"] },
  {func: 'ellipse', category: 'Game Lab', paletteParams: ['x','y','w','h'], params: ["200", "200", "400", "400"] },
  {func: 'line', category: 'Game Lab', paletteParams: ['x1','y1','x2','y2'], params: ["0", "0", "400", "400"] },
  {func: 'point', category: 'Game Lab', paletteParams: ['x','y'], params: ["200", "200"] },
  {func: 'rect', category: 'Game Lab', paletteParams: ['x','y','w','h'], params: ["100", "100", "200", "200"] },
  {func: 'triangle', category: 'Game Lab', paletteParams: ['x1','y1','x2','y2','x3','y3'], params: ["200", "0", "0", "400", "400", "400"] },
  {func: 'text', category: 'Game Lab', paletteParams: ['str','x','y','w','h'], params: ["'text'", "0", "0", "400", "100"] },
  {func: 'textAlign', category: 'Game Lab', paletteParams: ['horiz','vert'], params: ["CENTER", "TOP"] },
  {func: 'textSize', category: 'Game Lab', paletteParams: ['pixels'], params: ["12"] },
  {func: 'drawSprites', category: 'Game Lab' },
  {func: 'allSprites', category: 'Game Lab', block: 'allSprites', type: 'property' },
  {func: 'background', category: 'Game Lab', paletteParams: ['color'], params: ["'black'"] },
  {func: 'width', category: 'Game Lab', type: 'property' },
  {func: 'height', category: 'Game Lab', type: 'property' },
  {func: 'camera', category: 'Game Lab', type: 'property' },
  {func: 'camera.on', category: 'Game Lab' },
  {func: 'camera.off', category: 'Game Lab' },
  {func: 'camera.active', category: 'Game Lab', type: 'property' },
  {func: 'camera.mouseX', category: 'Game Lab', type: 'property' },
  {func: 'camera.mouseY', category: 'Game Lab', type: 'property' },
  {func: 'camera.position.x', category: 'Game Lab', type: 'property' },
  {func: 'camera.position.y', category: 'Game Lab', type: 'property' },
  {func: 'camera.zoom', category: 'Game Lab', type: 'property' },

  // Sprites
  {func: 'createSprite', category: 'Sprites', paletteParams: ['x','y','width','height'], params: ["200", "200", "30", "30"], type: 'either' },
  {func: 'var sprite = createSprite', category: 'Sprites', paletteParams: ['x','y','width','height'], params: ["200", "200", "30", "30"], noAutocomplete: true, docFunc: 'createSprite' },
  {func: 'setSpeed', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['speed','angle'], params: ["1", "90"], tipPrefix: '[Sprite].', modeOptionName: '*.setSpeed' },
  {func: 'getAnimationLabel', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.getAnimationLabel', type: 'value' },
  {func: 'getDirection', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.getDirection', type: 'value' },
  {func: 'getSpeed', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.getSpeed', type: 'value' },
  {func: 'remove', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.remove' },
  {func: 'addAnimation', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['label','animation'], params: ['"anim1"', "anim"], tipPrefix: '[Sprite].', modeOptionName: '*.addAnimation' },
  {func: 'addImage', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['label','image'], params: ['"img1"', "img"], tipPrefix: '[Sprite].', modeOptionName: '*.addImage' },
  {func: 'addSpeed', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['speed','angle'], params: ["1", "90"], tipPrefix: '[Sprite].', modeOptionName: '*.addSpeed' },
  {func: 'addToGroup', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['group'], params: ["group"], tipPrefix: '[Sprite].', modeOptionName: '*.addToGroup' },
  {func: 'bounce', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['target'], params: ["group"], tipPrefix: '[Sprite].', modeOptionName: '*.bounce', type: 'either' },
  {func: 'collide', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['target'], params: ["group"], tipPrefix: '[Sprite].', modeOptionName: '*.collide', type: 'either' },
  {func: 'displace', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['target'], params: ["group"], tipPrefix: '[Sprite].', modeOptionName: '*.displace', type: 'either' },
  {func: 'overlap', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['target'], params: ["group"], tipPrefix: '[Sprite].', modeOptionName: '*.overlap', type: 'either' },
  {func: 'changeAnimation', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['label'], params: ['"anim1"'], tipPrefix: '[Sprite].', modeOptionName: '*.changeAnimation' },
  {func: 'changeImage', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['label'], params: ['"img1"'], tipPrefix: '[Sprite].', modeOptionName: '*.changeImage' },
  {func: 'attractionPoint', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['speed','x','y'], params: ["1", "200", "200"], tipPrefix: '[Sprite].', modeOptionName: '*.attractionPoint' },
  {func: 'limitSpeed', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['max'], params: ["3"], tipPrefix: '[Sprite].', modeOptionName: '*.limitSpeed' },
  {func: 'setCollider', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['type','x','y','w','h'], params: ['"rectangle"', "0", "0", "20", "20"], tipPrefix: '[Sprite].', modeOptionName: '*.setCollider' },
  {func: 'setVelocity', blockPrefix: 'sprite.', category: 'Sprites', paletteParams: ['x','y'], params: ["1", "1"], tipPrefix: '[Sprite].', modeOptionName: '*.setVelocity' },
  {func: 'sprite.height', category: 'Sprites', modeOptionName: '*.height', type: 'property' },
  {func: 'sprite.width', category: 'Sprites', modeOptionName: '*.width', type: 'property' },
  {func: 'sprite.animation', category: 'Sprites', modeOptionName: '*.animation', type: 'property' },
  {func: 'depth', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.depth', type: 'property' },
  {func: 'friction', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.friction', type: 'property' },
  {func: 'immovable', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.immovable', type: 'property' },
  {func: 'life', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.life', type: 'property' },
  {func: 'mass', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.mass', type: 'property' },
  {func: 'maxSpeed', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.maxSpeed', type: 'property' },
  {func: 'position', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.position', type: 'property' },
  {func: 'sprite.position.x', category: 'Sprites', modeOptionName: 'sprite_position_x', type: 'property', noAutocomplete: true },
  {func: 'sprite.position.y', category: 'Sprites', modeOptionName: 'sprite_position_y', type: 'property', noAutocomplete: true },
  {func: 'previousPosition', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.previousPosition', type: 'property' },
  {func: 'sprite.previousPosition.x', category: 'Sprites', modeOptionName: 'sprite_previousPosition_x', type: 'property', noAutocomplete: true },
  {func: 'sprite.previousPosition.y', category: 'Sprites', modeOptionName: 'sprite_previousPosition_y', type: 'property', noAutocomplete: true },
  {func: 'removed', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.removed', type: 'property' },
  {func: 'restitution', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.restitution', type: 'property' },
  {func: 'rotateToDirection', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.rotateToDirection', type: 'property' },
  {func: 'rotation', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.rotation', type: 'property' },
  {func: 'rotationSpeed', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.rotationSpeed', type: 'property' },
  {func: 'scale', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.scale', type: 'property' },
  {func: 'shapeColor', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.shapeColor', type: 'property' },
  {func: 'touching', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.touching', type: 'property' },
  {func: 'velocity', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.velocity', type: 'property' },
  {func: 'sprite.velocity.x', category: 'Sprites', modeOptionName: 'sprite_velocity_x', type: 'property', noAutocomplete: true },
  {func: 'sprite.velocity.y', category: 'Sprites', modeOptionName: 'sprite_velocity_y', type: 'property', noAutocomplete: true },
  {func: 'visible', blockPrefix: 'sprite.', category: 'Sprites', tipPrefix: '[Sprite].', modeOptionName: '*.visible', type: 'property' },
/* TODO: decide whether to expose these Sprite properties:
camera
collider - USEFUL? (marshal AABB and CircleCollider)
debug
groups
mouseActive
mouseIsOver
mouseIsPressed
originalHeight
originalWidth
*/

/* TODO: decide whether to expose these Sprite methods:
addImage(labelimg) - 1 param version: (sets label to "normal" automatically)
draw() - OVERRIDE and/or USEFUL?
mirrorX(dir) - USEFUL?
mirrorY(dir) - USEFUL?
overlapPixel(pointXpointY) - USEFUL?
overlapPoint(pointXpointY) - USEFUL?
update() - USEFUL?
*/

  // Animations
  {func: 'loadAnimation', category: 'Animations', paletteParams: ['url1','url2'], params: ['"http://p5play.molleindustria.org/examples/assets/ghost_standing0001.png"', '"http://p5play.molleindustria.org/examples/assets/ghost_standing0002.png"'], type: 'either' },
  {func: 'var anim = loadAnimation', category: 'Animations', paletteParams: ['url1','url2'], params: ['"http://p5play.molleindustria.org/examples/assets/ghost_standing0001.png"', '"http://p5play.molleindustria.org/examples/assets/ghost_standing0002.png"'], noAutocomplete: true, docFunc: 'loadAnimation' },
  {func: 'animation', category: 'Animations', paletteParams: ['animation','x','y'], params: ["anim", "50", "50"] },
  {func: 'changeFrame', blockPrefix: 'anim.', category: 'Animations', paletteParams: ['frame'], params: ["0"], tipPrefix: '[Animation].', modeOptionName: '*.changeFrame' },
  {func: 'nextFrame', blockPrefix: 'anim.', category: 'Animations', tipPrefix: '[Animation].', modeOptionName: '*.nextFrame' },
  {func: 'previousFrame', blockPrefix: 'anim.', category: 'Animations', tipPrefix: '[Animation].', modeOptionName: '*.previousFrame' },
  {func: 'clone', blockPrefix: 'anim.', category: 'Animations', tipPrefix: '[Animation].', modeOptionName: '*.clone', type: 'value' },
  {func: 'getFrame', blockPrefix: 'anim.', category: 'Animations', tipPrefix: '[Animation].', modeOptionName: '*.getFrame', type: 'value' },
  {func: 'getLastFrame', blockPrefix: 'anim.', category: 'Animations', tipPrefix: '[Animation].', modeOptionName: '*.getLastFrame', type: 'value' },
  {func: 'goToFrame', blockPrefix: 'anim.', category: 'Animations', paletteParams: ['frame'], params: ["1"], tipPrefix: '[Animation].', modeOptionName: '*.goToFrame' },
  {func: 'play', blockPrefix: 'anim.', category: 'Animations', tipPrefix: '[Animation].', modeOptionName: '*.play' },
  {func: 'rewind', blockPrefix: 'anim.', category: 'Animations', tipPrefix: '[Animation].', modeOptionName: '*.rewind' },
  {func: 'stop', blockPrefix: 'anim.', category: 'Animations', tipPrefix: '[Animation].', modeOptionName: '*.stop' },
  {func: 'frameChanged', blockPrefix: 'anim.', category: 'Animations', tipPrefix: '[Animation].', modeOptionName: '*.frameChanged', type: 'property' },
  {func: 'frameDelay', blockPrefix: 'anim.', category: 'Animations', tipPrefix: '[Animation].', modeOptionName: '*.frameDelay', type: 'property' },
  {func: 'images', blockPrefix: 'anim.', category: 'Animations', tipPrefix: '[Animation].', modeOptionName: '*.images', type: 'property' },
  {func: 'looping', blockPrefix: 'anim.', category: 'Animations', tipPrefix: '[Animation].', modeOptionName: '*.looping', type: 'property' },
  {func: 'playing', blockPrefix: 'anim.', category: 'Animations', tipPrefix: '[Animation].', modeOptionName: '*.playing', type: 'property' },
  {func: 'anim.visible', category: 'Animations', modeOptionName: '*.visible', type: 'property' },
/* TODO: decide whether to expose these Animation methods:
draw(xy)
getFrameImage()
getHeight()
getImageAt(frame)
getWidth()
*/

  // Groups
  {func: 'Group', category: 'Groups', type: 'either' },
  {func: 'var group = new Group', category: 'Groups', type: 'either', docFunc: 'Group' },
  {func: 'add', blockPrefix: 'group.', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], tipPrefix: '[Group].', modeOptionName: '*.add' },
  {func: 'group.remove', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: 'group_remove', noAutocomplete: true }, /* avoid sprite.remove conflict */
  {func: 'clear', blockPrefix: 'group.', category: 'Groups', tipPrefix: '[Group].', modeOptionName: '*.clear' },
  {func: 'contains', blockPrefix: 'group.', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], tipPrefix: '[Group].', modeOptionName: '*.contains', type: 'value' },
  {func: 'get', blockPrefix: 'group.', category: 'Groups', paletteParams: ['i'], params: ["0"], tipPrefix: '[Group].', modeOptionName: '*.get', type: 'value' },
  {func: 'group.bounce', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_bounce', noAutocomplete: true }, /* avoid sprite.bounce conflict */
  {func: 'group.collide', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_collide', noAutocomplete: true }, /* avoid sprite.collide conflict */
  {func: 'group.displace', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_displace', noAutocomplete: true }, /* avoid sprite.displace conflict */
  {func: 'group.overlap', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_overlap', noAutocomplete: true }, /* avoid sprite.overlap conflict */
  {func: 'maxDepth', blockPrefix: 'group.', category: 'Groups', tipPrefix: '[Group].', modeOptionName: '*.maxDepth', type: 'value' },
  {func: 'minDepth', blockPrefix: 'group.', category: 'Groups', tipPrefix: '[Group].', modeOptionName: '*.minDepth', type: 'value' },

/* TODO: decide whether to expose these Group methods:
draw() - USEFUL?
*/

  // Events
  {func: 'keyIsPressed', category: 'Events', type: 'property' },
  {func: 'key', category: 'Events', type: 'property' },
  {func: 'keyCode', category: 'Events', type: 'property' },
  {func: 'keyDown', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' },
  {func: 'keyWentDown', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' },
  {func: 'keyWentUp', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' },
  {func: 'keyPressed', block: 'function keyPressed() {}', expansion: 'function keyPressed() {\n  __;\n}', category: 'Events' },
  {func: 'keyReleased', block: 'function keyReleased() {}', expansion: 'function keyReleased() {\n  __;\n}', category: 'Events' },
  {func: 'keyTyped', block: 'function keyTyped() {}', expansion: 'function keyTyped() {\n  __;\n}', category: 'Events' },
  {func: 'mouseX', category: 'Events', type: 'property' },
  {func: 'mouseY', category: 'Events', type: 'property' },
  {func: 'pmouseX', category: 'Events', type: 'property' },
  {func: 'pmouseY', category: 'Events', type: 'property' },
  {func: 'mouseButton', category: 'Events', type: 'property' },
  {func: 'mouseIsPressed', category: 'Events', type: 'property' },
  {func: 'mouseMoved', block: 'function mouseMoved() {}', expansion: 'function mouseMoved() {\n  __;\n}', category: 'Events' },
  {func: 'mouseDragged', block: 'function mouseDragged() {}', expansion: 'function mouseDragged() {\n  __;\n}', category: 'Events' },
  {func: 'mousePressed', block: 'function mousePressed() {}', expansion: 'function mousePressed() {\n  __;\n}', category: 'Events' },
  {func: 'mouseReleased', block: 'function mouseReleased() {}', expansion: 'function mouseReleased() {\n  __;\n}', category: 'Events' },
  {func: 'mouseClicked', block: 'function mouseClicked() {}', expansion: 'function mouseClicked() {\n  __;\n}', category: 'Events' },
  {func: 'mouseWheel', block: 'function mouseWheel() {}', expansion: 'function mouseWheel() {\n  __;\n}', category: 'Events' },

  // Math
  {func: 'sin', category: 'Math', paletteParams: ['angle'], params: ["0"], type: 'value' },
  {func: 'cos', category: 'Math', paletteParams: ['angle'], params: ["0"], type: 'value' },
  {func: 'tan', category: 'Math', paletteParams: ['angle'], params: ["0"], type: 'value' },
  {func: 'asin', category: 'Math', paletteParams: ['value'], params: ["0"], type: 'value' },
  {func: 'acos', category: 'Math', paletteParams: ['value'], params: ["0"], type: 'value' },
  {func: 'atan', category: 'Math', paletteParams: ['value'], params: ["0"], type: 'value' },
  {func: 'atan2', category: 'Math', paletteParams: ['y','x'], params: ["10", "10"], type: 'value' },
  {func: 'degrees', category: 'Math', paletteParams: ['radians'], params: ["0"], type: 'value' },
  {func: 'radians', category: 'Math', paletteParams: ['degrees'], params: ["0"], type: 'value' },
  {func: 'angleMode', category: 'Math', paletteParams: ['mode'], params: ["DEGREES"] },
  {func: 'random', category: 'Math', paletteParams: ['min','max'], params: ["1", "5"], type: 'value' },
  {func: 'randomGaussian', category: 'Math', paletteParams: ['mean','sd'], params: ["0", "15"], type: 'value' },
  {func: 'randomSeed', category: 'Math', paletteParams: ['seed'], params: ["99"] },
  {func: 'abs', category: 'Math', paletteParams: ['num'], params: ["-1"], type: 'value' },
  {func: 'ceil', category: 'Math', paletteParams: ['num'], params: ["0.1"], type: 'value' },
  {func: 'constrain', category: 'Math', paletteParams: ['num','low','high'], params: ["1.1", "0", "1"], type: 'value' },
  {func: 'dist', category: 'Math', paletteParams: ['x1','y1','x2','y2'], params: ["0", "0", "100", "100"], type: 'value' },
  {func: 'exp', category: 'Math', paletteParams: ['num'], params: ["1"], type: 'value' },
  {func: 'floor', category: 'Math', paletteParams: ['num'], params: ["0.9"], type: 'value' },
  {func: 'lerp', category: 'Math', paletteParams: ['start','stop','amt'], params: ["0", "100", "0.1"], type: 'value' },
  {func: 'log', category: 'Math', paletteParams: ['num'], params: ["1"], type: 'value' },
  {func: 'mag', category: 'Math', paletteParams: ['a','b'], params: ["100", "100"], type: 'value' },
  {func: 'map', category: 'Math', paletteParams: ['value','start1','stop1','start2','stop'], params: ["0.9", "0", "1", "0", "100"], type: 'value' },
  {func: 'max', category: 'Math', paletteParams: ['n1','n2'], params: ["1","3"], type: 'value' },
  {func: 'min', category: 'Math', paletteParams: ['n1','n2'], params: ["1", "3"], type: 'value' },
  {func: 'norm', category: 'Math', paletteParams: ['value','start','stop'], params: ["90", "0", "100"], type: 'value' },
  {func: 'pow', category: 'Math', paletteParams: ['n','e'], params: ["10", "2"], type: 'value' },
  {func: 'round', category: 'Math', paletteParams: ['num'], params: ["0.9"], type: 'value' },
  {func: 'sq', category: 'Math', paletteParams: ['num'], params: ["2"], type: 'value' },
  {func: 'sqrt', category: 'Math', paletteParams: ['num'], params: ["9"], type: 'value' },

  // Vector
  {func: 'x', category: 'Vector', modeOptionName: '*.x', type: 'property' },
  {func: 'y', category: 'Vector', modeOptionName: '*.y', type: 'property' },

  // Advanced
];

module.exports.categories = {
  'Game Lab': {
    color: 'yellow',
    rgb: COLOR_YELLOW,
    blocks: []
  },
  Sprites: {
    color: 'red',
    rgb: COLOR_RED,
    blocks: []
  },
  Animations: {
    color: 'red',
    rgb: COLOR_RED,
    blocks: []
  },
  Groups: {
    color: 'red',
    rgb: COLOR_RED,
    blocks: []
  },
  Data: {
    color: 'lightgreen',
    rgb: COLOR_LIGHT_GREEN,
    blocks: []
  },
  Drawing: {
    color: 'cyan',
    rgb: COLOR_CYAN,
    blocks: []
  },
  Events: {
    color: 'green',
    rgb: COLOR_GREEN,
    blocks: []
  },
  Advanced: {
    color: 'blue',
    rgb: COLOR_BLUE,
    blocks: []
  },
};

module.exports.additionalPredefValues = [
  'P2D', 'WEBGL', 'ARROW', 'CROSS', 'HAND', 'MOVE',
  'TEXT', 'WAIT', 'HALF_PI', 'PI', 'QUARTER_PI', 'TAU', 'TWO_PI', 'DEGREES',
  'RADIANS', 'CORNER', 'CORNERS', 'RADIUS', 'RIGHT', 'LEFT', 'CENTER', 'TOP',
  'BOTTOM', 'BASELINE', 'POINTS', 'LINES', 'TRIANGLES', 'TRIANGLE_FAN',
  'TRIANGLE_STRIP', 'QUADS', 'QUAD_STRIP', 'CLOSE', 'OPEN', 'CHORD', 'PIE',
  'PROJECT', 'SQUARE', 'ROUND', 'BEVEL', 'MITER', 'RGB', 'HSB', 'HSL', 'AUTO',
  'ALT', 'BACKSPACE', 'CONTROL', 'DELETE', 'DOWN_ARROW', 'ENTER', 'ESCAPE',
  'LEFT_ARROW', 'OPTION', 'RETURN', 'RIGHT_ARROW', 'SHIFT', 'TAB', 'UP_ARROW',
  'BLEND', 'ADD', 'DARKEST', 'LIGHTEST', 'DIFFERENCE', 'EXCLUSION',
  'MULTIPLY', 'SCREEN', 'REPLACE', 'OVERLAY', 'HARD_LIGHT', 'SOFT_LIGHT',
  'DODGE', 'BURN', 'THRESHOLD', 'GRAY', 'OPAQUE', 'INVERT', 'POSTERIZE',
  'DILATE', 'ERODE', 'BLUR', 'NORMAL', 'ITALIC', 'BOLD', '_DEFAULT_TEXT_FILL',
  '_DEFAULT_LEADMULT', '_CTX_MIDDLE', 'LINEAR', 'QUADRATIC', 'BEZIER',
  'CURVE', '_DEFAULT_STROKE', '_DEFAULT_FILL'
];
module.exports.showParamDropdowns = true;

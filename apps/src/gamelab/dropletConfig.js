var msg = require('./locale');
var api = require('./apiJavascript.js');
var consoleApi = require('../consoleApi');
var showAssetManager = require('../assetManagement/show');
var getAssetDropdown = require('../assetManagement/getAssetDropdown');

var COLOR_LIGHT_GREEN = '#D3E965';
var COLOR_RED = '#F78183';
var COLOR_CYAN = '#4DD0E1';
var COLOR_YELLOW = '#FFF176';
var COLOR_PINK = '#F57AC6';
var COLOR_PURPLE = '#BB77C7';
var COLOR_GREEN = '#68D995';
var COLOR_WHITE = '#FFFFFF';
var COLOR_BLUE = '#64B5F6';
var COLOR_ORANGE = '#FFB74D';

var spriteMethodPrefix = '[Sprite].';
var groupMethodPrefix = '[Group].';
var animMethodPrefix = '[Animation].';

var spriteBlockPrefix = 'sprite.';
var groupBlockPrefix = 'group.';
var animBlockPrefix = 'anim.';

var gameLab;

exports.injectGameLab = function (gamelab) {
  gameLab = gamelab;
};

// Flip the argument order so we can bind `typeFilter`.
function chooseAsset(typeFilter, callback) {
  showAssetManager(callback, typeFilter);
}

module.exports.blocks = [
  // Game Lab
  {func: 'loadImage', category: 'Game Lab', paletteParams: ['url'], params: ['"https://code.org/images/logo.png"'], type: 'either', dropdown: {0: function () { return getAssetDropdown('image'); }}, assetTooltip: {0: chooseAsset.bind(null, 'image')}, customDocURL: "http://p5js.org/reference/#/p5/loadImage"},
  {func: 'var img = loadImage', category: 'Game Lab', paletteParams: ['url'], params: ['"https://code.org/images/logo.png"'], noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/loadImage"},
  {func: 'image', category: 'Game Lab', paletteParams: ['image', 'srcX', 'srcY', 'srcW', 'srcH', 'x', 'y', 'w', 'h'], params: ["img", "0", "0", "img.width", "img.height", "0", "0", "img.width", "img.height"], noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/image"},
  {func: 'fill', category: 'Game Lab', paletteParams: ['color'], params: ["'yellow'"], customDocURL: "http://p5js.org/reference/#/p5/fill"},
  {func: 'noFill', category: 'Game Lab', customDocURL: "http://p5js.org/reference/#/p5/noFill"},
  {func: 'stroke', category: 'Game Lab', paletteParams: ['color'], params: ["'blue'"], customDocURL: "http://p5js.org/reference/#/p5/stroke"},
  {func: 'strokeWeight', category: 'Game Lab', paletteParams: ['size'], params: ["3"], customDocURL: "http://p5js.org/reference/#/p5/strokeWeight"},
  {func: 'noStroke', category: 'Game Lab', customDocURL: "http://p5js.org/reference/#/p5/noStroke"},
  {func: 'arc', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h', 'start', 'stop'], params: ["0", "0", "800", "800", "0", "HALF_PI"], customDocURL: "http://p5js.org/reference/#/p5/arc"},
  {func: 'ellipse', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h'], params: ["200", "200", "400", "400"], customDocURL: "http://p5js.org/reference/#/p5/ellipse"},
  {func: 'line', category: 'Game Lab', paletteParams: ['x1', 'y1', 'x2', 'y2'], params: ["0", "0", "400", "400"], customDocURL: "http://p5js.org/reference/#/p5/line"},
  {func: 'point', category: 'Game Lab', paletteParams: ['x', 'y'], params: ["200", "200"], customDocURL: "http://p5js.org/reference/#/p5/point"},
  {func: 'rect', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h'], params: ["100", "100", "200", "200"], customDocURL: "http://p5js.org/reference/#/p5/rect"},
  {func: 'regularPolygon', category: 'Game Lab', paletteParams: ['sides', 'size', 'x', 'y'], params: ["5", "50", "200", "200"]},
  {func: 'shape', category: 'Game Lab', paletteParams: ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'], params: ["200", "0", "0", "400", "400", "400"]},
  {func: 'triangle', category: 'Game Lab', paletteParams: ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'], params: ["200", "0", "0", "400", "400", "400"], noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/triangle"},
  {func: 'text', category: 'Game Lab', paletteParams: ['str', 'x', 'y', 'w', 'h'], params: ["'text'", "0", "0", "400", "100"], customDocURL: "http://p5js.org/reference/#/p5/text"},
  {func: 'textAlign', category: 'Game Lab', paletteParams: ['horiz', 'vert'], params: ["CENTER", "TOP"], customDocURL: "http://p5js.org/reference/#/p5/textAlign"},
  {func: 'textFont', category: 'Game Lab', paletteParams: ['font'], params: ["'Arial'"], customDocURL: "http://p5js.org/reference/#/p5/textFont"},
  {func: 'textSize', category: 'Game Lab', paletteParams: ['pixels'], params: ["12"], customDocURL: "http://p5js.org/reference/#/p5/textSize"},
  {func: 'drawSprites', category: 'Game Lab', customDocURL: "http://p5play.molleindustria.org/docs/classes/p5.play.html#method-updateSprites"},
  {func: 'background', category: 'Game Lab', paletteParams: ['color'], params: ["'black'"], customDocURL: "http://p5js.org/reference/#/p5/background"},
  {func: 'allSprites', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/p5.play.html#prop-allSprites"},
  {func: 'Game.allSprites', category: 'Game Lab', type: 'readonlyproperty'},
  {func: 'width', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/width"},
  {func: 'height', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/height"},
  {func: 'Game.width', category: 'Game Lab', type: 'readonlyproperty'},
  {func: 'Game.height', category: 'Game Lab', type: 'readonlyproperty'},
  {func: 'camera', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Camera.html"},
  {func: 'camera.on', category: 'Game Lab', customDocURL: "http://p5play.molleindustria.org/docs/classes/Camera.html#method-on"},
  {func: 'camera.off', category: 'Game Lab', customDocURL: "http://p5play.molleindustria.org/docs/classes/Camera.html#method-off"},
  {func: 'camera.isActive', category: 'Game Lab', type: 'value'},
  {func: 'camera.active', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Camera.html#prop-active"},
  {func: 'camera.mouseX', category: 'Game Lab', type: 'readonlyproperty', customDocURL: "http://p5play.molleindustria.org/docs/classes/Camera.html#prop-mouseX"},
  {func: 'camera.mouseY', category: 'Game Lab', type: 'readonlyproperty', customDocURL: "http://p5play.molleindustria.org/docs/classes/Camera.html#prop-mouseY"},
  {func: 'camera.position.x', category: 'Game Lab', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Camera.html#prop-position"},
  {func: 'camera.position.y', category: 'Game Lab', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Camera.html#prop-position"},
  {func: 'camera.x', category: 'Game Lab', type: 'property'},
  {func: 'camera.y', category: 'Game Lab', type: 'property'},
  {func: 'camera.zoom', category: 'Game Lab', type: 'property', customDocURL: "http://p5play.molleindustria.org/docs/classes/Camera.html#prop-zoom"},
  {func: 'console.log', parent: consoleApi, category: 'Game Lab', paletteParams: ['message'], params: ['"message"']},
  {func: 'playSound', parent: api, category: 'Game Lab', paletteParams: ['url'], params: ['"https://studio.code.org/blockly/media/example.mp3"'], dropdown: {0: function () { return getAssetDropdown('audio'); }}, 'assetTooltip': {0: chooseAsset.bind(null, 'audio')}},

  // Sprites
  {func: 'createSprite', category: 'Sprites', paletteParams: ['x', 'y', 'width', 'height'], params: ["200", "200", "30", "30"], type: 'either', customDocURL: "http://p5play.molleindustria.org/docs/classes/p5.play.html#method-createSprite"},
  {func: 'var sprite = createSprite', category: 'Sprites', paletteParams: ['x', 'y', 'width', 'height'], params: ["200", "200", "30", "30"], noAutocomplete: true, docFunc: 'createSprite', customDocURL: "http://p5play.molleindustria.org/docs/classes/p5.play.html#method-createSprite"},
  {func: 'setSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['speed', 'angle'], params: ["1", "90"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.setSpeed', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-setSpeed"},
  {func: 'getAnimationLabel', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.getAnimationLabel', type: 'value', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-getAnimationLabel"},
  {func: 'getDirection', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.getDirection', type: 'value', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-getDirection"},
  {func: 'getFrame', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.getFrame', type: 'value'},
  {func: 'getFrameCount', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.getFrameCount', type: 'value'},
  {func: 'getSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.getSpeed', type: 'value', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-getSpeed"},
  {func: 'remove', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.remove', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-remove"},
  {func: 'addAnimation', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['label', 'animation'], params: ['"anim1"', "anim"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.addAnimation', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-addAnimation"},
  {func: 'addImage', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['label', 'image'], params: ['"img1"', "img"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.addImage', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-addImage"},
  {func: 'addSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['speed', 'angle'], params: ["1", "90"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.addSpeed', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-addSpeed"},
  {func: 'addToGroup', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['group'], params: ["group"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.addToGroup', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-addToGroup"},
  {func: 'bounce', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['target'], params: ["group"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.bounce', type: 'either', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-bounce"},
  {func: 'collide', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['target'], params: ["group"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.collide', type: 'either', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-collide"},
  {func: 'displace', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['target'], params: ["group"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.displace', type: 'either', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-displace"},
  {func: 'overlap', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['target'], params: ["group"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.overlap', type: 'either', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-overlap"},
  {func: 'changeAnimation', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['label'], params: ['"anim1"'], tipPrefix: spriteMethodPrefix, modeOptionName: '*.changeAnimation', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-changeAnimation"},
  {func: 'changeImage', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['label'], params: ['"img1"'], tipPrefix: spriteMethodPrefix, modeOptionName: '*.changeImage', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-changeImage"},
  {func: 'frameDidChange', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.frameDidChange', type: 'value'},
  {func: 'attractionPoint', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['speed', 'x', 'y'], params: ["1", "200", "200"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.attractionPoint', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-attractionPoint"},
  {func: 'limitSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['max'], params: ["3"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.limitSpeed', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-limitSpeed"},
  {func: 'mirrorX', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['dir'], params: ["-1"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.mirrorX'},
  {func: 'mirrorY', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['dir'], params: ["-1"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.mirrorY'},
  {func: 'nextFrame', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.nextFrame'},
  {func: 'pause', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.pause'},
  {func: 'play', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.play'},
  {func: 'previousFrame', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.previousFrame'},
  {func: 'setCollider', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['type', 'x', 'y', 'w', 'h'], params: ['"rectangle"', "0", "0", "20", "20"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.setCollider', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-setCollider"},
  {func: 'setFrame', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['frame'], params: ["0"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.setFrame'},
  {func: 'setVelocity', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['x', 'y'], params: ["1", "1"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.setVelocity', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#method-setVelocity"},
  {func: 'sprite.height', category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.height', type: 'property', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-height"},
  {func: 'sprite.width', category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.width', type: 'property', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-width"},
  {func: 'sprite.animation', category: 'Sprites', modeOptionName: '*.animation', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-animation"},
  {func: 'depth', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.depth', type: 'property', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-depth"},
  {func: 'frameDelay', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.frameDelay', type: 'property'},
  {func: 'friction', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.friction', type: 'property', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-friction"},
  {func: 'immovable', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.immovable', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-immovable"},
  {func: 'life', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.life', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-life"},
  {func: 'lifetime', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.lifetime', type: 'property'},
  {func: 'mass', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.mass', type: 'property', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-mass"},
  {func: 'maxSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.maxSpeed', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-maxSpeed"},
  {func: 'position', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.position', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-position"},
  {func: 'sprite.position.x', category: 'Sprites', modeOptionName: 'sprite_position_x', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-position"},
  {func: 'sprite.position.y', category: 'Sprites', modeOptionName: 'sprite_position_y', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-position"},
  {func: 'previousPosition', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.previousPosition', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-previousPosition"},
  {func: 'sprite.previousPosition.x', category: 'Sprites', modeOptionName: 'sprite_previousPosition_x', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-previousPosition"},
  {func: 'sprite.previousPosition.y', category: 'Sprites', modeOptionName: 'sprite_previousPosition_y', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-previousPosition"},
  {func: 'removed', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.removed', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-removed"},
  {func: 'restitution', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.restitution', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-restitution"},
  {func: 'rotateToDirection', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.rotateToDirection', type: 'property', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-rotateToDirection"},
  {func: 'rotation', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.rotation', type: 'property', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-rotation"},
  {func: 'rotationSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.rotationSpeed', type: 'property', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-rotationSpeed"},
  {func: 'scale', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.scale', type: 'property', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-scale"},
  {func: 'shapeColor', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.shapeColor', type: 'property', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-shapeColor"},
  {func: 'touching', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.touching', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-touching"},
  {func: 'velocity', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.velocity', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-velocity"},
  {func: 'velocityX', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.velocityX', type: 'property'},
  {func: 'velocityY', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.velocityY', type: 'property'},
  {func: 'sprite.velocity.x', category: 'Sprites', modeOptionName: 'sprite_velocity_x', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-velocity"},
  {func: 'sprite.velocity.y', category: 'Sprites', modeOptionName: 'sprite_velocity_y', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-velocity"},
  {func: 'visible', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.visible', type: 'property', customDocURL: "http://p5play.molleindustria.org/docs/classes/Sprite.html#prop-visible"},
  {func: 'x', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.x', type: 'property'},
  {func: 'y', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.y', type: 'property'},

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
  {func: 'loadAnimation', category: 'Animations', paletteParams: ['url1', 'url2'], params: ['"http://p5play.molleindustria.org/examples/assets/ghost_standing0001.png"', '"http://p5play.molleindustria.org/examples/assets/ghost_standing0002.png"'], type: 'either', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/p5.play.html#method-loadAnimation"},
  {func: 'var anim = loadAnimation', category: 'Animations', paletteParams: ['url1', 'url2'], params: ['"http://p5play.molleindustria.org/examples/assets/ghost_standing0001.png"', '"http://p5play.molleindustria.org/examples/assets/ghost_standing0002.png"'], noAutocomplete: true, docFunc: 'loadAnimation', customDocURL: "http://p5play.molleindustria.org/docs/classes/p5.play.html#method-loadAnimation"},
  {func: 'animation', category: 'Animations', paletteParams: ['animation', 'x', 'y'], params: ["anim", "50", "50"], noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/p5.play.html#method-animation"},
  {func: 'changeFrame', blockPrefix: animBlockPrefix, category: 'Animations', paletteParams: ['frame'], params: ["0"], tipPrefix: animMethodPrefix, modeOptionName: '*.changeFrame', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#method-changeFrame"},
  {func: 'anim.nextFrame', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: 'anim_nextFrame', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#method-changeFrame"},
  {func: 'anim.previousFrame', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: 'anim_previousFrame', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#method-changeFrame"},
  {func: 'clone', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.clone', type: 'value', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#method-clone"},
  {func: 'getFrame', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: 'anim_getFrame', type: 'value', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#method-getFrame"},
  {func: 'getLastFrame', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.getLastFrame', type: 'value', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#method-getLastFrame"},
  {func: 'goToFrame', blockPrefix: animBlockPrefix, category: 'Animations', paletteParams: ['frame'], params: ["1"], tipPrefix: animMethodPrefix, modeOptionName: '*.goToFrame', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#method-goToFrame"},
  {func: 'anim.play', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: 'anim_play', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#method-play"},
  {func: 'rewind', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.rewind', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#method-rewind"},
  {func: 'stop', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.stop', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#method-stop"},
  {func: 'frameChanged', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.frameChanged', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#prop-frameChanged"},
  {func: 'anim.frameDelay', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: 'anim_frameDelay', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#prop-frameDelay"},
  {func: 'images', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.images', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#prop-images"},
  {func: 'looping', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.looping', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#prop-looping"},
  {func: 'playing', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.playing', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#prop-playing"},
  {func: 'anim.visible', category: 'Animations', modeOptionName: 'anim_visible', type: 'property', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Animation.html#prop-visible"},
/* TODO: decide whether to expose these Animation methods:
draw(xy)
getFrameImage()
getHeight()
getImageAt(frame)
getWidth()
*/

  // Groups
  {func: 'Group', category: 'Groups', type: 'either', customDocURL: "http://p5play.molleindustria.org/docs/classes/Group.html"},
  {func: 'var group = new Group', category: 'Groups', type: 'either', docFunc: 'Group', customDocURL: "http://p5play.molleindustria.org/docs/classes/Group.html"},
  {func: 'add', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], tipPrefix: groupMethodPrefix, modeOptionName: '*.add', customDocURL: "http://p5play.molleindustria.org/docs/classes/Group.html#method-add"},
  {func: 'group.remove', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: 'group_remove', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Group.html#method-remove"}, /* avoid sprite.remove conflict */
  {func: 'clear', blockPrefix: groupBlockPrefix, category: 'Groups', tipPrefix: groupMethodPrefix, modeOptionName: '*.clear', customDocURL: "http://p5play.molleindustria.org/docs/classes/Group.html#method-clear"},
  {func: 'contains', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], tipPrefix: groupMethodPrefix, modeOptionName: '*.contains', type: 'value', customDocURL: "http://p5play.molleindustria.org/docs/classes/Group.html#method-contains"},
  {func: 'get', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['i'], params: ["0"], tipPrefix: groupMethodPrefix, modeOptionName: '*.get', type: 'value', customDocURL: "http://p5play.molleindustria.org/docs/classes/Group.html#method-get"},
  {func: 'group.bounce', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_bounce', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Group.html#method-bounce"}, /* avoid sprite.bounce conflict */
  {func: 'group.collide', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_collide', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Group.html#method-collide"}, /* avoid sprite.collide conflict */
  {func: 'group.displace', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_displace', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Group.html#method-displace"}, /* avoid sprite.displace conflict */
  {func: 'group.overlap', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_overlap', noAutocomplete: true, customDocURL: "http://p5play.molleindustria.org/docs/classes/Group.html#method-overlap"}, /* avoid sprite.overlap conflict */
  {func: 'maxDepth', blockPrefix: groupBlockPrefix, category: 'Groups', tipPrefix: groupMethodPrefix, modeOptionName: '*.maxDepth', type: 'value', customDocURL: "http://p5play.molleindustria.org/docs/classes/Group.html#method-maxDepth"},
  {func: 'minDepth', blockPrefix: groupBlockPrefix, category: 'Groups', tipPrefix: groupMethodPrefix, modeOptionName: '*.minDepth', type: 'value', customDocURL: "http://p5play.molleindustria.org/docs/classes/Group.html#method-minDepth"},

/* TODO: decide whether to expose these Group methods:
draw() - USEFUL?
*/

  // Input
  {func: 'keyIsPressed', category: 'Input', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/keyIsPressed"},
  {func: 'key', category: 'Input', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/key"},
  {func: 'keyCode', category: 'Input', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/keyCode"},
  {func: 'keyDown', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Input', type: 'value', customDocURL: "http://p5play.molleindustria.org/docs/classes/p5.play.html#method-keyDown"},
  {func: 'keyWentDown', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Input', type: 'value', customDocURL: "http://p5play.molleindustria.org/docs/classes/p5.play.html#method-keyWentDown"},
  {func: 'keyWentUp', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Input', type: 'value', customDocURL: "http://p5play.molleindustria.org/docs/classes/p5.play.html#method-keyWentUp"},
  {func: 'keyPressed', block: 'function keyPressed() {}', expansion: 'function keyPressed() {\n  __;\n}', category: 'Input', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/keyPressed"},
  {func: 'keyReleased', block: 'function keyReleased() {}', expansion: 'function keyReleased() {\n  __;\n}', category: 'Input', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/keyReleased"},
  {func: 'keyTyped', block: 'function keyTyped() {}', expansion: 'function keyTyped() {\n  __;\n}', category: 'Input', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/keyTyped"},
  {func: 'mouseX', category: 'Input', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseX"},
  {func: 'mouseY', category: 'Input', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseY"},
  {func: 'Game.mouseX', category: 'Input', type: 'readonlyproperty'},
  {func: 'Game.mouseY', category: 'Input', type: 'readonlyproperty'},
  {func: 'pmouseX', category: 'Input', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/pmouseX"},
  {func: 'pmouseY', category: 'Input', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/pmouseY"},
  {func: 'mouseButton', category: 'Input', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseButton"},
  {func: 'mouseDidMove', category: 'Input', type: 'value'},
  {func: 'mouseDown', paletteParams: ['button'], params: ["LEFT"], category: 'Input', type: 'value', customDocURL: "http://p5play.molleindustria.org/docs/classes/p5.play.html#method-mouseDown"},
  {func: 'mouseIsPressed', category: 'Input', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseIsPressed"},
  {func: 'mouseMoved', block: 'function mouseMoved() {}', expansion: 'function mouseMoved() {\n  __;\n}', category: 'Input', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseMoved"},
  {func: 'mouseDragged', block: 'function mouseDragged() {}', expansion: 'function mouseDragged() {\n  __;\n}', category: 'Input', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseDragged"},
  {func: 'mousePressed', block: 'function mousePressed() {}', expansion: 'function mousePressed() {\n  __;\n}', category: 'Input', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mousePressed"},
  {func: 'mouseReleased', block: 'function mouseReleased() {}', expansion: 'function mouseReleased() {\n  __;\n}', category: 'Input', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseReleased"},
  {func: 'mouseClicked', block: 'function mouseClicked() {}', expansion: 'function mouseClicked() {\n  __;\n}', category: 'Input', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseClicked"},
  {func: 'mouseWentDown', paletteParams: ['button'], params: ["LEFT"], category: 'Input', type: 'value', customDocURL: "http://p5play.molleindustria.org/docs/classes/p5.play.html#method-mouseWentDown"},
  {func: 'mouseWentUp', paletteParams: ['button'], params: ["LEFT"], category: 'Input', type: 'value', customDocURL: "http://p5play.molleindustria.org/docs/classes/p5.play.html#method-mouseWentUp"},
  {func: 'mouseWheel', block: 'function mouseWheel() {}', expansion: 'function mouseWheel() {\n  __;\n}', category: 'Input', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseWheel"},
  {func: 'mousePressedOver', paletteParams: ['sprite'], params: ["sprite"], category: 'Input', type: 'value'},

  // Math
  {func: 'sin', category: 'Math', paletteParams: ['angle'], params: ["0"], type: 'value'},
  {func: 'cos', category: 'Math', paletteParams: ['angle'], params: ["0"], type: 'value'},
  {func: 'tan', category: 'Math', paletteParams: ['angle'], params: ["0"], type: 'value'},
  {func: 'asin', category: 'Math', paletteParams: ['value'], params: ["0"], type: 'value'},
  {func: 'acos', category: 'Math', paletteParams: ['value'], params: ["0"], type: 'value'},
  {func: 'atan', category: 'Math', paletteParams: ['value'], params: ["0"], type: 'value'},
  {func: 'atan2', category: 'Math', paletteParams: ['y', 'x'], params: ["10", "10"], type: 'value'},
  {func: 'degrees', category: 'Math', paletteParams: ['radians'], params: ["0"], type: 'value'},
  {func: 'radians', category: 'Math', paletteParams: ['degrees'], params: ["0"], type: 'value'},
  {func: 'angleMode', category: 'Math', paletteParams: ['mode'], params: ["DEGREES"]},
  {func: 'random', category: 'Math', paletteParams: ['min', 'max'], params: ["1", "5"], type: 'value'},
  {func: 'randomGaussian', category: 'Math', paletteParams: ['mean', 'sd'], params: ["0", "15"], type: 'value'},
  {func: 'randomSeed', category: 'Math', paletteParams: ['seed'], params: ["99"]},
  {func: 'abs', category: 'Math', paletteParams: ['num'], params: ["-1"], type: 'value'},
  {func: 'ceil', category: 'Math', paletteParams: ['num'], params: ["0.1"], type: 'value'},
  {func: 'constrain', category: 'Math', paletteParams: ['num', 'low', 'high'], params: ["1.1", "0", "1"], type: 'value'},
  {func: 'dist', category: 'Math', paletteParams: ['x1', 'y1', 'x2', 'y2'], params: ["0", "0", "100", "100"], type: 'value'},
  {func: 'exp', category: 'Math', paletteParams: ['num'], params: ["1"], type: 'value'},
  {func: 'floor', category: 'Math', paletteParams: ['num'], params: ["0.9"], type: 'value'},
  {func: 'lerp', category: 'Math', paletteParams: ['start', 'stop', 'amt'], params: ["0", "100", "0.1"], type: 'value'},
  {func: 'log', category: 'Math', paletteParams: ['num'], params: ["1"], type: 'value'},
  {func: 'mag', category: 'Math', paletteParams: ['a', 'b'], params: ["100", "100"], type: 'value'},
  {func: 'map', category: 'Math', paletteParams: ['value', 'start1', 'stop1', 'start2', 'stop'], params: ["0.9", "0", "1", "0", "100"], type: 'value'},
  {func: 'max', category: 'Math', paletteParams: ['n1', 'n2'], params: ["1", "3"], type: 'value'},
  {func: 'min', category: 'Math', paletteParams: ['n1', 'n2'], params: ["1", "3"], type: 'value'},
  {func: 'norm', category: 'Math', paletteParams: ['value', 'start', 'stop'], params: ["90", "0", "100"], type: 'value'},
  {func: 'pow', category: 'Math', paletteParams: ['n', 'e'], params: ["10", "2"], type: 'value'},
  {func: 'round', category: 'Math', paletteParams: ['num'], params: ["0.9"], type: 'value'},
  {func: 'sq', category: 'Math', paletteParams: ['num'], params: ["2"], type: 'value'},
  {func: 'sqrt', category: 'Math', paletteParams: ['num'], params: ["9"], type: 'value'},

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
  Input: {
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

/*
 * Set the showExamplesLink config value so that the droplet tooltips will show
 * an 'Examples' link that opens documentation in a lightbox:
 */
module.exports.showExamplesLink = true;

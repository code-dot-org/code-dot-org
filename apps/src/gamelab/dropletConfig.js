var msg = require('./locale');
var api = require('./apiJavascript.js');

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

module.exports.blocks = [
  // Game Lab
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
  {func: 'text', category: 'Game Lab', paletteParams: ['str','x','y','width','height'], params: ["'text'", "0", "0", "400", "100"] },
  {func: 'textSize', category: 'Game Lab', paletteParams: ['pixels'], params: ["12"] },
  {func: 'drawSprites', category: 'Game Lab' },
  {func: 'allSprites', block: 'allSprites', category: 'Game Lab' },
  {func: 'background', category: 'Game Lab', paletteParams: ['color'], params: ["'black'"] },
  {func: 'width', block: 'width', category: 'Game Lab' },
  {func: 'height', block: 'height', category: 'Game Lab' },
  {func: 'camera', block: 'camera', category: 'Game Lab' },
  {func: 'camera.on', category: 'Game Lab' },
  {func: 'camera.off', category: 'Game Lab' },
  {func: 'camera.active', block: 'camera.active', category: 'Game Lab' },
  {func: 'camera.mouseX', block: 'camera.mouseX', category: 'Game Lab' },
  {func: 'camera.mouseY', block: 'camera.mouseY', category: 'Game Lab' },
  {func: 'camera.position.x', block: 'camera.position.x', category: 'Game Lab' },
  {func: 'camera.position.y', block: 'camera.position.y', category: 'Game Lab' },
  {func: 'camera.zoom', block: 'camera.zoom', category: 'Game Lab' },

  // Sprites
  {func: 'createSprite', blockPrefix: 'var sprite = createSprite', category: 'Sprites', paletteParams: ['x','y','width','height'], params: ["200", "200", "30", "30"], type: 'both' },
  {func: 'sprite.setSpeed', category: 'Sprites', paletteParams: ['speed','angle'], params: ["1", "90"], modeOptionName: '*.setSpeed' },
  {func: 'sprite.getDirection', category: 'Sprites', modeOptionName: '*.getDirection', type: 'value' },
  {func: 'sprite.remove', category: 'Sprites', modeOptionName: '*.remove' },
  {func: 'sprite.height', block: 'sprite.height', category: 'Sprites', modeOptionName: '*.height' },
  {func: 'sprite.width', block: 'sprite.width', category: 'Sprites', modeOptionName: '*.width' },

  // Groups
  {func: 'Group', blockPrefix: 'var group = new Group', category: 'Groups', type: 'both' },
  {func: 'group.add', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: '*.add' },
  {func: 'group.remove', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: '*.remove' },

  // Events
  {func: 'keyIsPressed', block: 'keyIsPressed', category: 'Events' },
  {func: 'key', block: 'key', category: 'Events' },
  {func: 'keyCode', block: 'keyCode', category: 'Events' },
  {func: 'keyDown', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' },
  {func: 'keyWentDown', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' },
  {func: 'keyWentUp', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' },
  {func: 'keyPressed', block: 'function keyPressed() {}', expansion: 'function keyPressed() {\n  __;\n}', category: 'Events' },
  {func: 'keyReleased', block: 'function keyReleased() {}', expansion: 'function keyReleased() {\n  __;\n}', category: 'Events' },
  {func: 'keyTyped', block: 'function keyTyped() {}', expansion: 'function keyTyped() {\n  __;\n}', category: 'Events' },
  {func: 'mouseX', block: 'mouseX', category: 'Events' },
  {func: 'mouseY', block: 'mouseY', category: 'Events' },
  {func: 'pmouseX', block: 'pmouseX', category: 'Events' },
  {func: 'pmouseY', block: 'pmouseY', category: 'Events' },
  {func: 'mouseButton', block: 'mouseButton', category: 'Events' },
  {func: 'mouseIsPressed', block: 'mouseIsPressed', category: 'Events' },
  {func: 'mouseMoved', block: 'function mouseMoved() {}', expansion: 'function mouseMoved() {\n  __;\n}', category: 'Events' },
  {func: 'mouseDragged', block: 'function mouseDragged() {}', expansion: 'function mouseDragged() {\n  __;\n}', category: 'Events' },
  {func: 'mousePressed', block: 'function mousePressed() {}', expansion: 'function mousePressed() {\n  __;\n}', category: 'Events' },
  {func: 'mouseReleased', block: 'function mouseReleased() {}', expansion: 'function mouseReleased() {\n  __;\n}', category: 'Events' },
  {func: 'mouseClicked', block: 'function mouseClicked() {}', expansion: 'function mouseClicked() {\n  __;\n}', category: 'Events' },
  {func: 'mouseWheel', block: 'function mouseWheel() {}', expansion: 'function mouseWheel() {\n  __;\n}', category: 'Events' },

  // Advanced
  {func: 'foo', parent: api, category: 'Advanced' },
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

module.exports.autocompleteFunctionsWithParens = true;
module.exports.showParamDropdowns = true;

var msg = require('./locale');
var utils = require('../utils');
var blockUtils = require('../block_utils');
var tb = blockUtils.createToolbox;
var blockOfType = blockUtils.blockOfType;
var createCategory = blockUtils.createCategory;

/*
 * Configuration for all levels.
 */
var levels = module.exports = {};

levels.sandbox =  {
  ideal: Infinity,
  requiredBlocks: [
  ],
  scale: {
    'snapRadius': 2
  },
  softButtons: [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  freePlay: true,
  toolbox:
    tb(blockOfType('gamelab_foo')),
  startBlocks:
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};

// Base config for levels created via levelbuilder
levels.custom = utils.extend(levels.sandbox, {
  editCode: true,
  codeFunctions: {
    // Game Lab
    "fill": null,
    "noFill": null,
    "stroke": null,
    "strokeWeight": null,
    "noStroke": null,
    "arc": null,
    "ellipse": null,
    "line": null,
    "point": null,
    "rect": null,
    "regularPolygon": null,
    "shape": null,
    "text": null,
    "textAlign": null,
    "textFont": null,
    "textSize": null,
    "drawSprites": null,
    "allSprites": null,
    "background": null,
    "width": null,
    "height": null,
    "camera.on": null,
    "camera.off": null,
    "camera.isActive": null,
    "camera.mouseX": null,
    "camera.mouseY": null,
    "camera.position.x": null,
    "camera.position.y": null,
    "camera.zoom": null,
    "playSound": null,

    // Sprites
    "var sprite = createSprite": null,
    "setSpeed": null,
    "getAnimationLabel": null,
    "getDirection": null,
    "getSpeed": null,
    "remove": null,
    "addAnimation": null,
    "addImage": null,
    "addSpeed": null,
    "bounce": null,
    "collide": null,
    "displace": null,
    "overlap": null,
    "changeAnimation": null,
    "changeImage": null,
    "attractionPoint": null,
    "setCollider": null,
    "setVelocity": null,
    "sprite.height": null,
    "sprite.width": null,
    "depth": null,
    "lifetime": null,
    "mirrorX": null,
    "mirrorY": null,
    "nextFrame": null,
    "pause": null,
    "play": null,
    "setFrame": null,
    "sprite.x": null,
    "sprite.y": null,
    "rotateToDirection": null,
    "rotation": null,
    "rotationSpeed": null,
    "scale": null,
    "shapeColor": null,
    "sprite.velocityX": null,
    "sprite.velocityY": null,
    "visible": null,

    // Groups
    "var group = new Group": null,
    "add": null,
    "group.remove": null,
    "clear": null,
    "contains": null,
    "get": null,
    "group.bounce": null,
    "group.collide": null,
    "group.displace": null,
    "group.overlap": null,
    "maxDepth": null,
    "minDepth": null,

    // Input
    "didMouseMove": null,
    "keyDown": null,
    "keyWentDown": null,
    "keyWentUp": null,
    "mouseDown": null,
    "mouseWentDown": null,
    "mouseWentUp": null,
    "mouseX": null,
    "mouseY": null,

    // Control
    "forLoop_i_0_4": null,
    "ifBlock": null,
    "ifElseBlock": null,
    "whileBlock": null,

    // Math
    "addOperator": null,
    "subtractOperator": null,
    "multiplyOperator": null,
    "divideOperator": null,
    "equalityOperator": null,
    "inequalityOperator": null,
    "greaterThanOperator": null,
    "greaterThanOrEqualOperator": null,
    "lessThanOperator": null,
    "lessThanOrEqualOperator": null,
    "andOperator": null,
    "orOperator": null,
    "notOperator": null,
    "randomNumber_min_max": null,
    "mathRound": null,
    "mathAbs": null,
    "mathMax": null,
    "mathMin": null,
    "mathRandom": null,

    // Variables
    "declareAssign_x": null,
    "declareNoAssign_x": null,
    "assign_x": null,
    "declareAssign_str_hello_world": null,
    "substring": null,
    "indexOf": null,
    "includes": null,
    "length": null,
    "toUpperCase": null,
    "toLowerCase": null,
    "declareAssign_list_abd": null,
    "listLength": null,

    // Functions
    "functionParams_none": null,
    "functionParams_n": null,
    "callMyFunction": null,
    "callMyFunction_n": null,
    "return": null
  },
  startBlocks: [
    'function setup() {',
    '  ',
    '}',
    'function draw() {',
    '  ',
    '}',
    ''].join('\n'),
});

levels.ec_sandbox = utils.extend(levels.custom, {
});


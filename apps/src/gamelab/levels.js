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
    "var img = loadImage": null,
    "image": null,
    "fill": null,
    "noFill": null,
    "stroke": null,
    "noStroke": null,
    "arc": null,
    "ellipse": null,
    "line": null,
    "point": null,
    "rect": null,
    "triangle": null,
    "text": null,
    "textAlign": null,
    "textSize": null,
    "drawSprites": null,
    "allSprites": null,
    "background": null,
    "width": null,
    "height": null,
    "camera": null,
    "camera.on": null,
    "camera.off": null,
    "camera.active": null,
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
    "addToGroup": null,
    "bounce": null,
    "collide": null,
    "displace": null,
    "overlap": null,
    "changeAnimation": null,
    "changeImage": null,
    "attractionPoint": null,
    "limitSpeed": null,
    "setCollider": null,
    "setVelocity": null,
    "sprite.height": null,
    "sprite.width": null,
    "sprite.animation": null,
    "depth": null,
    "friction": null,
    "immovable": null,
    "life": null,
    "mass": null,
    "maxSpeed": null,
    "sprite.position.x": null,
    "sprite.position.y": null,
    "sprite.previousPosition.x": null,
    "sprite.previousPosition.y": null,
    "removed": null,
    "restitution": null,
    "rotateToDirection": null,
    "rotation": null,
    "rotationSpeed": null,
    "scale": null,
    "shapeColor": null,
    "touching": null,
    "sprite.velocity.x": null,
    "sprite.velocity.y": null,
    "visible": null,

    // Animations
    "var anim = loadAnimation": null,
    "animation": null,
    "changeFrame": null,
    "nextFrame": null,
    "previousFrame": null,
    "clone": null,
    "getFrame": null,
    "getLastFrame": null,
    "goToFrame": null,
    "play": null,
    "rewind": null,
    "stop": null,
    "frameChanged": null,
    "frameDelay": null,
    "images": null,
    "looping": null,
    "playing": null,
    "anim.visible": null,

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

    // Events
    "keyIsPressed": null,
    "key": null,
    "keyCode": null,
    "keyPressed": null,
    "keyReleased": null,
    "keyTyped": null,
    "keyDown": null,
    "keyWentDown": null,
    "keyWentUp": null,
    "mouseX": null,
    "mouseY": null,
    "pmouseX": null,
    "pmouseY": null,
    "mouseButton": null,
    "mouseIsPressed": null,
    "mouseMoved": null,
    "mouseDragged": null,
    "mousePressed": null,
    "mouseReleased": null,
    "mouseClicked": null,
    "mouseWheel": null,

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


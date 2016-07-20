var msg = require('./locale');
var utils = require('../utils');
var blockUtils = require('../block_utils');
var tb = blockUtils.createToolbox;
var blockOfType = blockUtils.blockOfType;
var createCategory = blockUtils.createCategory;

// TODO (bbuchanan): Continue documenting the game lab level object properties.
/**
 * Properties of the game lab level object
 * @typedef {Object} GameLabLevel
 *
 * @property {Object.<string, null>} codeFunctions - collection of blocks to
 *           be made available in the droplet toolbox on this level.
 *
 * @property {?boolean} hideAnimationMode - If true, the animation tab should be
 *           inaccessible to the student on this level.
 *
 * @property {?SerializedAnimationList} startAnimations - Initial state of the
 *           animation list for this level / what to return to on reset.
 */

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
    "draw": null,
    "drawSprites": null,
    "Game.allSprites": null,
    "Game.width": null,
    "Game.height": null,
    "Game.mouseX": null,
    "Game.mouseY": null,
    "Game.frameRate": null,
    "Game.frameCount": null,
    "playSound": null,
    "keyDown": null,
    "keyWentDown": null,
    "keyWentUp": null,
    "mouseDidMove": null,
    "mouseDown": null,
    "mouseIsOver": null,
    "mouseWentDown": null,
    "mouseWentUp": null,
    "mousePressedOver": null,
    "camera.on": null,
    "camera.off": null,
    "camera.isActive": null,
    "camera.mouseX": null,
    "camera.mouseY": null,
    "camera.x": null,
    "camera.y": null,
    "camera.zoom": null,
    "comment_GameLab": null,

    // Sprites
    "var sprite = createSprite": null,
    "setSpeed": null,
    "getDirection": null,
    "getSpeed": null,
    "isTouching": null,
    "destroy": null,
    "pointTo": null,
    "bounce": null,
    "bounceOff": null,
    "collide": null,
    "displace": null,
    "overlap": null,
    "setAnimation": null,
    "setCollider": null,
    "setVelocity": null,
    "sprite.height": null,
    "sprite.width": null,
    "getScaledWidth": null,
    "getScaledHeight": null,
    "debug": null,
    "depth": null,
    "lifetime": null,
    "mirrorX": null,
    "mirrorY": null,
    "nextFrame": null,
    "pause": null,
    "play": null,
    "setFrame": null,
    "x": null,
    "y": null,
    "rotateToDirection": null,
    "rotation": null,
    "rotationSpeed": null,
    "scale": null,
    "shapeColor": null,
    "velocityX": null,
    "velocityY": null,
    "visible": null,
    "comment_Sprites": null,

    // Groups
    "var group = createGroup": null,
    "add": null,
    "remove": null,
    "clear": null,
    "contains": null,
    "get": null,
    "group.isTouching": null,
    "group.bounce": null,
    "group.bounceOff": null,
    "group.collide": null,
    "group.displace": null,
    "group.overlap": null,
    "maxDepth": null,
    "minDepth": null,
    "destroyEach": null,
    "pointToEach": null,
    "setAnimationEach": null,
    "setColorEach": null,
    "setColliderEach": null,
    "setDepthEach": null,
    "setHeightEach": null,
    "setLifetimeEach": null,
    "setMirrorXEach": null,
    "setMirrorYEach": null,
    "setRotateToDirectionEach": null,
    "setRotationEach": null,
    "setRotationSpeedEach": null,
    "setScaleEach": null,
    "setSpeedEach": null,
    "setVelocityEach": null,
    "setVelocityXEach": null,
    "setVelocityYEach": null,
    "setVisibleEach": null,
    "setWidthEach": null,
    "comment_Groups": null,

    // Drawing
    "background": null,
    "fill": null,
    "noFill": null,
    "stroke": null,
    "strokeWeight": null,
    "noStroke": null,
    "color": null,
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
    "comment_Drawing": null,

    // Control
    "forLoop_i_0_4": null,
    "ifBlock": null,
    "ifElseBlock": null,
    "whileBlock": null,
    "comment_Control": null,

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
    "comment_Math": null,

    // Variables
    "declareAssign_x": null,
    "declareNoAssign_x": null,
    "assign_x": null,
    "console.log": null,
    "declareAssign_str_hello_world": null,
    "substring": null,
    "indexOf": null,
    "includes": null,
    "length": null,
    "toUpperCase": null,
    "toLowerCase": null,
    "declareAssign_list_abd": null,
    "listLength": null,
    "comment_Variables": null,

    // Functions
    "functionParams_none": null,
    "functionParams_n": null,
    "callMyFunction": null,
    "callMyFunction_n": null,
    "return": null,
    "comment": null
  },
  startBlocks: null,
});

levels.ec_sandbox = utils.extend(levels.custom, {
});


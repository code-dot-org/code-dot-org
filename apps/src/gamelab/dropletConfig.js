/* global dashboard */

var api = require('./apiJavascript.js');
var consoleApi = require('../consoleApi');
import * as audioApi from '@cdo/apps/lib/util/audioApi';
var getAssetDropdown = require('../assetManagement/getAssetDropdown');

var COLOR_LIGHT_GREEN = '#D3E965';
var COLOR_RED = '#F78183';
var COLOR_CYAN = '#4DD0E1';
var COLOR_YELLOW = '#FFF176';
var COLOR_BLUE = '#64B5F6';

var spriteMethodPrefix = '[Sprite].';
var groupMethodPrefix = '[Group].';
var animMethodPrefix = '[Animation].';

var spriteBlockPrefix = 'sprite.';
var groupBlockPrefix = 'group.';
var animBlockPrefix = 'anim.';

const colliderTypeDropdown = ['rectangle', 'circle'].map(s => ({
  text: `"${s}"`,
  display: `"${s}"`
}));

var gameLab;
var getAnimationDropdown;

exports.injectGameLab = function (gamelab) {
  gameLab = gamelab;
  getAnimationDropdown = gameLab.getAnimationDropdown.bind(gameLab);
  audioApi.injectExecuteCmd(gameLab.executeCmd.bind(gameLab));
};

// Flip the argument order so we can bind `typeFilter`.
function chooseAsset(typeFilter, callback) {
  dashboard.assets.showAssetManager(callback, typeFilter, null, {
    showUnderageWarning: !gameLab.studioApp_.reduxStore.getState().pageConstants.is13Plus
  });
}

module.exports.blocks = [
  // Game Lab
  {func: 'draw', block: 'function draw() {}', expansion: 'function draw() {\n  __;\n}', category: 'Game Lab', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/draw" },
  {func: 'drawSprites', category: 'Game Lab', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/p5.play.html#method-drawSprites" },
  {func: 'allSprites', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/p5.play.html#prop-allSprites" },
  {func: 'Game.allSprites', category: 'Game Lab', type: 'readonlyproperty' },
  /* disabled since we aren't suggesting these global properties be used - commenting these out prevents droplet from turning 'width' and 'height' into blocks when referenced as locals or parameters */
  //  {func: 'width', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true },
  //  {func: 'height', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true },
  {func: 'Game.width', category: 'Game Lab', type: 'readonlyproperty', customDocURL: "http://p5js.org/reference/#/p5/width" },
  {func: 'Game.height', category: 'Game Lab', type: 'readonlyproperty', customDocURL: "http://p5js.org/reference/#/p5/height" },
  {func: 'Game.mouseX', category: 'Game Lab', type: 'readonlyproperty', customDocURL: "http://p5js.org/reference/#/p5/mouseX" },
  {func: 'Game.mouseY', category: 'Game Lab', type: 'readonlyproperty', customDocURL: "http://p5js.org/reference/#/p5/mouseY" },
  {func: 'Game.frameRate', category: 'Game Lab', type: 'property', customDocURL: "http://p5js.org/reference/#/p5/frameRate" },
  {func: 'Game.frameCount', category: 'Game Lab', type: 'readonlyproperty', customDocURL: "http://p5js.org/reference/#/p5/frameCount" },
  {...audioApi.dropletConfig.playSound, category: 'Game Lab'},
  {...audioApi.dropletConfig.stopSound, category: 'Game Lab'},
  {func: 'keyIsPressed', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/keyIsPressed" },
  {func: 'key', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/key" },
  {func: 'keyCode', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/keyCode" },
  {func: 'keyDown', paletteParams: ['code'], params: ['"up"'], dropdown: { 0: ['"up"', '"down"', '"left"', '"right"', '"space"', '"a"'] }, category: 'Game Lab', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/p5.play.html#method-keyDown" },
  {func: 'keyWentDown', paletteParams: ['code'], params: ['"up"'], dropdown: { 0: ['"up"', '"down"', '"left"', '"right"', '"space"', '"a"'] }, category: 'Game Lab', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/p5.play.html#method-keyWentDown" },
  {func: 'keyWentUp', paletteParams: ['code'], params: ['"up"'], dropdown: { 0: ['"up"', '"down"', '"left"', '"right"', '"space"', '"a"'] }, category: 'Game Lab', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/p5.play.html#method-keyWentUp" },
  {func: 'keyPressed', block: 'function keyPressed() {}', expansion: 'function keyPressed() {\n  __;\n}', category: 'Game Lab', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/keyPressed" },
  {func: 'keyReleased', block: 'function keyReleased() {}', expansion: 'function keyReleased() {\n  __;\n}', category: 'Game Lab', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/keyReleased" },
  {func: 'keyTyped', block: 'function keyTyped() {}', expansion: 'function keyTyped() {\n  __;\n}', category: 'Game Lab', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/keyTyped" },
  {func: 'mouseX', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseX" },
  {func: 'mouseY', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseY" },
  {func: 'pmouseX', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/pmouseX" },
  {func: 'pmouseY', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/pmouseY" },
  {func: 'mouseButton', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseButton" },
  {func: 'mouseDidMove', category: 'Game Lab', type: 'value' },
  {func: 'mouseDown', paletteParams: ['button'], params: ['"leftButton"'], category: 'Game Lab', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/p5.play.html#method-mouseDown" },
  {func: 'mouseIsOver', paletteParams: ['sprite'], params: ["sprite"], category: 'Game Lab', type: 'value' },
  {func: 'mouseIsPressed', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseIsPressed" },
  {func: 'mouseMoved', block: 'function mouseMoved() {}', expansion: 'function mouseMoved() {\n  __;\n}', category: 'Game Lab', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseMoved" },
  {func: 'mouseDragged', block: 'function mouseDragged() {}', expansion: 'function mouseDragged() {\n  __;\n}', category: 'Game Lab', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseDragged" },
  {func: 'mousePressed', block: 'function mousePressed() {}', expansion: 'function mousePressed() {\n  __;\n}', category: 'Game Lab', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mousePressed" },
  {func: 'mouseReleased', block: 'function mouseReleased() {}', expansion: 'function mouseReleased() {\n  __;\n}', category: 'Game Lab', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseReleased" },
  {func: 'mouseClicked', block: 'function mouseClicked() {}', expansion: 'function mouseClicked() {\n  __;\n}', category: 'Game Lab', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseClicked" },
  {func: 'mouseWentDown', paletteParams: ['button'], params: ['"leftButton"'], category: 'Game Lab', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/p5.play.html#method-mouseWentDown" },
  {func: 'mouseWentUp', paletteParams: ['button'], params: ['"leftButton"'], category: 'Game Lab', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/p5.play.html#method-mouseWentUp" },
  {func: 'mouseWheel', block: 'function mouseWheel() {}', expansion: 'function mouseWheel() {\n  __;\n}', category: 'Game Lab', noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/mouseWheel" },
  {func: 'mousePressedOver', paletteParams: ['sprite'], params: ["sprite"], category: 'Game Lab', type: 'value' },
  {func: 'camera', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/p5.play.html#prop-camera" },
  {func: 'camera.on', category: 'Game Lab', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Camera.html#method-on" },
  {func: 'camera.off', category: 'Game Lab', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Camera.html#method-off" },
  {func: 'camera.isActive', category: 'Game Lab', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Camera.html#prop-active" },
  {func: 'camera.active', category: 'Game Lab', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Camera.html#prop-active" },
  {func: 'camera.mouseX', category: 'Game Lab', type: 'readonlyproperty', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Camera.html#prop-mouseX" },
  {func: 'camera.mouseY', category: 'Game Lab', type: 'readonlyproperty', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Camera.html#prop-mouseY" },
  {func: 'camera.position.x', category: 'Game Lab', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Camera.html#prop-position" },
  {func: 'camera.position.y', category: 'Game Lab', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Camera.html#prop-position" },
  {func: 'camera.x', category: 'Game Lab', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Camera.html#prop-position" },
  {func: 'camera.y', category: 'Game Lab', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Camera.html#prop-position" },
  {func: 'camera.zoom', category: 'Game Lab', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Camera.html#prop-zoom" },
  {func: 'comment_GameLab', block: '// Comment', expansion: '// ', category: 'Game Lab' },

  // Sprites
  {func: 'createSprite', category: 'Sprites', paramButtons: { minArgs: 2, maxArgs: 4}, paletteParams: ['x','y'], params: ["200", "200"], type: 'either', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/p5.play.html#method-createSprite" },
  {func: 'var sprite = createSprite', category: 'Sprites', paletteParams: ['x','y'], params: ["200", "200"], noAutocomplete: true, docFunc: 'createSprite', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/p5.play.html#method-createSprite" },
  {func: 'createEdgeSprites', category: 'Sprites'},
  {func: 'leftEdge', category: 'Sprites', type: 'readonlyproperty'},
  {func: 'rightEdge', category: 'Sprites', type: 'readonlyproperty'},
  {func: 'bottomEdge', category: 'Sprites', type: 'readonlyproperty'},
  {func: 'topEdge', category: 'Sprites', type: 'readonlyproperty'},
  {func: 'edges', category: 'Sprites', type: 'readonlyproperty'},
  {func: 'setSpeedAndDirection', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['speed','angle'], params: ["1", "90"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.setSpeedAndDirection', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-setSpeed" },
  {func: 'getAnimationLabel', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.getAnimationLabel', type: 'value', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-getAnimationLabel" },
  {func: 'getDirection', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.getDirection', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-getDirection" },
  {func: 'getFrame', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.getFrame', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-getFrame" },
  {func: 'getSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.getSpeed', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-getSpeed" },
  {func: 'isTouching', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['target'], params: ["target"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.isTouching', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-overlap" },
  {func: 'sprite.remove', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: 'sprite_remove', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-remove" },
  {func: 'destroy', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.destroy', customDocUrl: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-remove" },
  {func: 'pointTo', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['x','y'], params: ["200", "200"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.pointTo' },
  {func: 'addAnimation', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['label','animation'], params: ['"animation_1"', "anim"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.addAnimation', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-addAnimation" },
  {func: 'addImage', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['label','image'], params: ['"img1"', "img"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.addImage', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-addImage" },
  {func: 'addSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['speed','angle'], params: ["1", "90"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.addSpeed', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-addSpeed" },
  {func: 'addToGroup', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['group'], params: ["group"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.addToGroup', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-addToGroup" },
  {func: 'bounce', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['target'], params: ["target"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.bounce', type: 'either', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-bounce" },
  {func: 'bounceOff', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['target'], params: ["target"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.bounceOff', type: 'either' },
  {func: 'collide', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['target'], params: ["target"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.collide', type: 'either', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-collide" },
  {func: 'displace', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['target'], params: ["target"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.displace', type: 'either', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-displace" },
  {func: 'overlap', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['target'], params: ["target"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.overlap', type: 'either', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-overlap" },
  {func: 'changeAnimation', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['label'], params: ['"animation_1"'], tipPrefix: spriteMethodPrefix, modeOptionName: '*.changeAnimation', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-changeAnimation" },
  {func: 'setAnimation', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['label'], params: ['"animation_1"'], dropdown: { 0: function () { return getAnimationDropdown(); } }, tipPrefix: spriteMethodPrefix, modeOptionName: '*.setAnimation'},
  {func: 'changeImage', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['label'], params: ['"img1"'], tipPrefix: spriteMethodPrefix, modeOptionName: '*.changeImage', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-changeImage" },
  {func: 'frameDidChange', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.frameDidChange', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#prop-frameChanged" },
  {func: 'attractionPoint', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['speed','x','y'], params: ["1", "200", "200"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.attractionPoint', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-attractionPoint" },
  {func: 'limitSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['max'], params: ["3"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.limitSpeed', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-limitSpeed" },
  {func: 'mirrorX', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['dir'], params: ["-1"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.mirrorX', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-mirrorX" },
  {func: 'mirrorY', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['dir'], params: ["-1"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.mirrorY', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-mirrorY" },
  {func: 'nextFrame', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.nextFrame', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-nextFrame" },
  {func: 'pause', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.pause', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-stop" },
  {func: 'play', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.play', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-play" },
  {func: 'previousFrame', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.previousFrame' },
  {func: 'setCollider', blockPrefix: spriteBlockPrefix, category: 'Sprites', paramButtons: { minArgs: 1, maxArgs: 6 }, paletteParams: ['type'], params: ['"rectangle"'], dropdown: { 0: colliderTypeDropdown }, tipPrefix: spriteMethodPrefix, modeOptionName: '*.setCollider', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-setCollider" },
  {func: 'setFrame', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['frame'], params: ["0"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.setFrame', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-changeFrame" },
  {func: 'setVelocity', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['x','y'], params: ["1", "1"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.setVelocity', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#method-setVelocity" },
  {func: 'sprite.height', category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.height', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-height" },
  {func: 'sprite.width', category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.width', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-width" },
  {func: 'getScaledWidth', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.getScaledWidth', type: 'value' },
  {func: 'getScaledHeight', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.getScaledHeight', type: 'value' },
  {func: 'sprite.animation', category: 'Sprites', modeOptionName: '*.animation', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-animation" },
  {func: 'debug', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.debug', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-debug" },
  {func: 'depth', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.depth', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-depth" },
  {func: 'frameDelay', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.frameDelay', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#prop-frameDelay" },
  {func: 'friction', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.friction', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-friction" },
  {func: 'immovable', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.immovable', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-immovable" },
  {func: 'life', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.life', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-life" },
  {func: 'lifetime', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.lifetime', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-life" },
  {func: 'mass', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.mass', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-mass" },
  {func: 'maxSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.maxSpeed', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-maxSpeed" },
  {func: 'position', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.position', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-position" },
  {func: 'sprite.position.x', category: 'Sprites', modeOptionName: 'sprite_position_x', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-position" },
  {func: 'sprite.position.y', category: 'Sprites', modeOptionName: 'sprite_position_y', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-position" },
  {func: 'previousPosition', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.previousPosition', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-previousPosition" },
  {func: 'sprite.previousPosition.x', category: 'Sprites', modeOptionName: 'sprite_previousPosition_x', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-previousPosition" },
  {func: 'sprite.previousPosition.y', category: 'Sprites', modeOptionName: 'sprite_previousPosition_y', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-previousPosition" },
  {func: 'removed', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.removed', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-removed" },
  {func: 'restitution', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.restitution', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-restitution" },
  {func: 'bounciness', category: 'Sprites', blockPrefix: spriteBlockPrefix, modeOptionName: '*.bounciness', type: 'property', customDocUrl: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-restitution"},
  {func: 'rotateToDirection', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.rotateToDirection', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-rotateToDirection" },
  {func: 'rotation', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.rotation', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-rotation" },
  {func: 'rotationSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.rotationSpeed', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-rotationSpeed" },
  {func: 'scale', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.scale', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-scale" },
  {func: 'shapeColor', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.shapeColor', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-shapeColor" },
  {func: 'touching', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.touching', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-touching" },
  {func: 'velocity', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.velocity', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-velocity" },
  {func: 'velocityX', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.velocityX', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-velocity" },
  {func: 'velocityY', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.velocityY', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-velocity" },
  {func: 'sprite.velocity.x', category: 'Sprites', modeOptionName: 'sprite_velocity_x', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-velocity" },
  {func: 'sprite.velocity.y', category: 'Sprites', modeOptionName: 'sprite_velocity_y', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-velocity" },
  {func: 'visible', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.visible', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-visible" },
  {func: 'x', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.x', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-position" },
  {func: 'y', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.y', type: 'property', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Sprite.html#prop-position" },
  {func: 'comment_Sprites', block: '// Comment', expansion: '// ', category: 'Sprites' },

/* TODO: decide whether to expose these Sprite properties:
camera
collider - USEFUL? (marshal AABB and CircleCollider)
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
overlapPixel(pointXpointY) - USEFUL?
overlapPoint(pointXpointY) - USEFUL?
update() - USEFUL?
*/

  // Animations
  {func: 'loadAnimation', category: 'Animations', paletteParams: ['url1','url2'], params: ['"https://code-dot-org.github.io/p5.play/examples/assets/ghost_standing0001.png"', '"https://code-dot-org.github.io/p5.play/examples/assets/ghost_standing0002.png"'], type: 'either', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/p5.play.html#method-loadAnimation" },
  {func: 'var anim = loadAnimation', category: 'Animations', paletteParams: ['url1','url2'], params: ['"https://code-dot-org.github.io/p5.play/examples/assets/ghost_standing0001.png"', '"https://code-dot-org.github.io/p5.play/examples/assets/ghost_standing0002.png"'], noAutocomplete: true, docFunc: 'loadAnimation', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/p5.play.html#method-loadAnimation" },
  {func: 'animation', category: 'Animations', paletteParams: ['animation','x','y'], params: ["anim", "50", "50"], noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/p5.play.html#method-animation" },
  {func: 'changeFrame', blockPrefix: animBlockPrefix, category: 'Animations', paletteParams: ['frame'], params: ["0"], tipPrefix: animMethodPrefix, modeOptionName: '*.changeFrame', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-changeFrame" },
  {func: 'anim.nextFrame', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: 'anim_nextFrame', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-nextFrame" },
  {func: 'anim.previousFrame', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: 'anim_previousFrame', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-previousFrame" },
  {func: 'clone', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.clone', type: 'value', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-clone" },
  {func: 'getFrame', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: 'anim_getFrame', type: 'value', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-getFrame" },
  {func: 'getLastFrame', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.getLastFrame', type: 'value', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-getLastFrame" },
  {func: 'goToFrame', blockPrefix: animBlockPrefix, category: 'Animations', paletteParams: ['frame'], params: ["1"], tipPrefix: animMethodPrefix, modeOptionName: '*.goToFrame', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-goToFrame" },
  {func: 'anim.play', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: 'anim_play', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-play" },
  {func: 'rewind', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.rewind', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-rewind" },
  {func: 'stop', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.stop', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#method-stop" },
  {func: 'frameChanged', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.frameChanged', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#prop-frameChanged" },
  {func: 'anim.frameDelay', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: 'anim_frameDelay', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#prop-frameDelay" },
  {func: 'images', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.images', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#prop-images" },
  {func: 'looping', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.looping', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#prop-looping" },
  {func: 'playing', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.playing', type: 'readonlyproperty', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#prop-playing" },
  {func: 'anim.visible', category: 'Animations', modeOptionName: 'anim_visible', type: 'property', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Animation.html#prop-visible" },
/* TODO: decide whether to expose these Animation methods:
draw(xy)
getFrameImage()
getHeight()
getImageAt(frame)
getWidth()
*/

  // Groups
  {func: 'createGroup', category: 'Groups', type: 'either', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html" },
  {func: 'var group = createGroup', category: 'Groups', noAutocomplete: true, docFunc: 'createGroup', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html" },
  {func: 'Group', category: 'Groups', type: 'either', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html" },
  {func: 'var group = new Group', category: 'Groups', type: 'either', docFunc: 'Group', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html" },
  {func: 'add', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], tipPrefix: groupMethodPrefix, modeOptionName: '*.add', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html#method-add" },
  {func: 'remove', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], tipPrefix: groupMethodPrefix, modeOptionName: '*.remove', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html#method-remove" },
  {func: 'clear', blockPrefix: groupBlockPrefix, category: 'Groups', tipPrefix: groupMethodPrefix, modeOptionName: '*.clear', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html#method-clear" },
  {func: 'contains', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], tipPrefix: groupMethodPrefix, modeOptionName: '*.contains', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html#method-contains" },
  {func: 'get', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['i'], params: ["0"], tipPrefix: groupMethodPrefix, modeOptionName: '*.get', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html#method-get" },
  {func: 'group.isTouching', category: 'Groups', paletteParams: ['target'], params: ["target"], modeOptionName: 'group_isTouching', noAutocomplete: true, type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html#method-overlap" }, /* avoid sprite.isTouching conflict */
  {func: 'group.bounce', category: 'Groups', paletteParams: ['target'], params: ["target"], modeOptionName: 'group_bounce', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html#method-bounce" }, /* avoid sprite.bounce conflict */
  {func: 'group.bounceOff', category: 'Groups', paletteParams: ['target'], params: ["target"], modeOptionName: 'group_bounceOff', noAutocomplete: true }, /* avoid sprite.bounceOff conflict */
  {func: 'group.collide', category: 'Groups', paletteParams: ['target'], params: ["target"], modeOptionName: 'group_collide', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html#method-collide" }, /* avoid sprite.collide conflict */
  {func: 'group.displace', category: 'Groups', paletteParams: ['target'], params: ["target"], modeOptionName: 'group_displace', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html#method-displace" }, /* avoid sprite.displace conflict */
  {func: 'group.overlap', category: 'Groups', paletteParams: ['target'], params: ["target"], modeOptionName: 'group_overlap', noAutocomplete: true, customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html#method-overlap" }, /* avoid sprite.overlap conflict */
  {func: 'maxDepth', blockPrefix: groupBlockPrefix, category: 'Groups', tipPrefix: groupMethodPrefix, modeOptionName: '*.maxDepth', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html#method-maxDepth" },
  {func: 'minDepth', blockPrefix: groupBlockPrefix, category: 'Groups', tipPrefix: groupMethodPrefix, modeOptionName: '*.minDepth', type: 'value', customDocURL: "https://code-dot-org.github.io/p5.play/docs/classes/Group.html#method-minDepth" },
  {func: 'destroyEach', blockPrefix: groupBlockPrefix, category: 'Groups', tipPrefix: groupMethodPrefix, modeOptionName: '*.destroyEach' },
  {func: 'pointToEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['x','y'], params: ["200", "200"], tipPrefix: groupMethodPrefix, modeOptionName: '*.pointToEach' },
  {func: 'setAnimationEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['label'], params: ['"animation_1"'], dropdown: { 0: function () { return getAnimationDropdown(); } }, tipPrefix: groupMethodPrefix, modeOptionName: '*.setAnimationEach'},
  {func: 'setColorEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['color'], params: ['"blue"'], dropdown: { 0: ['"blue"', 'color(255, 0, 0)', 'color(255, 0, 0, 127)'] }, tipPrefix: groupMethodPrefix, modeOptionName: '*.setColorEach' },
  {func: 'setColliderEach', blockPrefix: groupBlockPrefix, category: 'Groups', paramButtons: { minArgs: 1, maxArgs: 6 }, paletteParams: ['type'], params: ['"rectangle"'], dropdown: { 0: colliderTypeDropdown }, tipPrefix: groupMethodPrefix, modeOptionName: '*.setColliderEach' },
  {func: 'setDepthEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['depth'], params: ["1"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setDepthEach' },
  {func: 'setHeightEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['height'], params: ["50"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setHeightEach' },
  {func: 'setLifetimeEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['lifetime'], params: ["5"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setLifetimeEach' },
  {func: 'setMirrorXEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['dir'], params: ["-1"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setMirrorXEach' },
  {func: 'setMirrorYEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['dir'], params: ["-1"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setMirrorYEach' },
  {func: 'setRotateToDirectionEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['bool'], params: ["true"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setRotateToDirectionEach' },
  {func: 'setRotationEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['angle'], params: ["90"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setRotationEach' },
  {func: 'setRotationSpeedEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['speed'], params: ["5"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setRotationSpeedEach' },
  {func: 'setScaleEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['scale'], params: ["5"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setScaleEach' },
  {func: 'setSpeedAndDirectionEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['speed','angle'], params: ["1", "90"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setSpeedAndDirectionEach' },
  {func: 'setVelocityEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['x','y'], params: ["1", "1"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setVelocityEach' },
  {func: 'setVelocityXEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['velocityX'], params: ["3"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setVelocityXEach' },
  {func: 'setVelocityYEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['velocityY'], params: ["3"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setVelocityYEach' },
  {func: 'setVisibleEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['bool'], params: ["false"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setVisibleEach' },
  {func: 'setWidthEach', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['width'], params: ["50"], tipPrefix: groupMethodPrefix, modeOptionName: '*.setWidthEach' },
  {func: 'comment_Groups', block: '// Comment', expansion: '// ', category: 'Groups' },
/* TODO: decide whether to expose these Group methods:
draw() - USEFUL?
*/

  // Drawing
  {func: 'loadImage', category: 'Drawing', paletteParams: ['url'], params: ['"https://code.org/images/logo.png"'], type: 'either', dropdown: { 0: function () { return getAssetDropdown('image'); } }, assetTooltip: { 0: chooseAsset.bind(null, 'image') }, customDocURL: "http://p5js.org/reference/#/p5/loadImage" },
  {func: 'var img = loadImage', category: 'Drawing', paletteParams: ['url'], params: ['"https://code.org/images/logo.png"'], noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/loadImage" },
  {func: 'image', category: 'Drawing', paletteParams: ['image','srcX','srcY','srcW','srcH','x','y','w','h'], params: ["img", "0", "0", "img.width", "img.height", "0", "0", "img.width", "img.height"], noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/image" },
  {func: 'background', category: 'Drawing', paletteParams: ['color'], params: ['"white"'], dropdown: { 0: ['"white"', 'color(255, 0, 0)', 'color(255, 0, 0, 127)'] }, customDocURL: "http://p5js.org/reference/#/p5/background" },
  {func: 'fill', category: 'Drawing', paletteParams: ['color'], params: ['"yellow"'], dropdown: { 0: ['"yellow"', 'color(255, 0, 0)', 'color(255, 0, 0, 127)'] }, customDocURL: "http://p5js.org/reference/#/p5/fill" },
  {func: 'noFill', category: 'Drawing', customDocURL: "http://p5js.org/reference/#/p5/noFill" },
  {func: 'stroke', category: 'Drawing', paletteParams: ['color'], params: ['"blue"'], dropdown: { 0: ['"blue"', 'color(255, 0, 0)', 'color(255, 0, 0, 127)'] }, customDocURL: "http://p5js.org/reference/#/p5/stroke" },
  {func: 'strokeWeight', category: 'Drawing', paletteParams: ['size'], params: ["3"], customDocURL: "http://p5js.org/reference/#/p5/strokeWeight" },
  {func: 'color', category: 'Drawing', paramButtons: { minArgs: 1, maxArgs: 4}, paletteParams: ['r','g','b'], params: ["255", "255", "255"], type: 'value', customDocURL: "http://p5js.org/reference/#/p5/color" },
  {func: 'noStroke', category: 'Drawing', customDocURL: "http://p5js.org/reference/#/p5/noStroke" },
  {func: 'arc', category: 'Drawing', paletteParams: ['x','y','w','h','start','stop'], params: ["0", "0", "800", "800", "0", "90"], customDocURL: "http://p5js.org/reference/#/p5/arc" },
  {func: 'ellipse', category: 'Drawing', paletteParams: ['x','y','w','h'], params: ["200", "200", "400", "400"], customDocURL: "http://p5js.org/reference/#/p5/ellipse" },
  {func: 'line', category: 'Drawing', paletteParams: ['x1','y1','x2','y2'], params: ["0", "0", "400", "400"], customDocURL: "http://p5js.org/reference/#/p5/line" },
  {func: 'point', category: 'Drawing', paletteParams: ['x','y'], params: ["200", "200"], customDocURL: "http://p5js.org/reference/#/p5/point" },
  {func: 'rect', category: 'Drawing', paletteParams: ['x','y','w','h'], params: ["100", "100", "200", "200"], customDocURL: "http://p5js.org/reference/#/p5/rect" },
  {func: 'regularPolygon', category: 'Drawing', paletteParams: ['x','y','sides','size'], params: ["200", "200", "5", "50"] },
  {func: 'shape', category: 'Drawing', paramButtons: { minArgs: 6 }, paletteParams: ['x1','y1','x2','y2','x3','y3'], params: ["200", "0", "0", "400", "400", "400"] },
  {func: 'triangle', category: 'Drawing', paletteParams: ['x1','y1','x2','y2','x3','y3'], params: ["200", "0", "0", "400", "400", "400"], noAutocomplete: true, customDocURL: "http://p5js.org/reference/#/p5/triangle" },
  {func: 'text', category: 'Drawing', paletteParams: ['str','x','y'], params: ['"text"', "0", "15"], paramButtons: { minArgs: 3, maxArgs: 5}, customDocURL: "http://p5js.org/reference/#/p5/text" },
  {func: 'textAlign', category: 'Drawing', paletteParams: ['horiz','vert'], params: ["CENTER", "TOP"], customDocURL: "http://p5js.org/reference/#/p5/textAlign" },
  {func: 'textFont', category: 'Drawing', paletteParams: ['font'], params: ['"Arial"'], customDocURL: "http://p5js.org/reference/#/p5/textFont" },
  {func: 'textSize', category: 'Drawing', paletteParams: ['pixels'], params: ["12"], customDocURL: "http://p5js.org/reference/#/p5/textSize" },
  {func: 'comment_Drawing', block: '// Comment', expansion: '// ', category: 'Drawing' },

  // Control
  {func: 'comment_Control', block: '// Comment', expansion: '// ', category: 'Control' },

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
  {func: 'comment_Math', block: '// Comment', expansion: '// ', category: 'Math' },

  // Variables
  {func: 'console.log', parent: consoleApi, category: 'Variables', paletteParams: ['message'], params: ['"message"'] },
  {func: 'comment_Variables', block: '// Comment', expansion: '// ', category: 'Variables' },

  // Data
  {func: 'getUserId', parent: api, category: 'Game Lab', noAutocomplete: true},
  {func: 'getKeyValue', parent: api, category: 'Game Lab', noAutocomplete: true},
  {func: 'setKeyValue', parent: api, category: 'Game Lab', noAutocomplete: true},

  // Advanced
];

module.exports.categories = {
  'Game Lab': {
    id: 'gamelab',
    color: 'yellow',
    rgb: COLOR_YELLOW,
    blocks: []
  },
  Sprites: {
    id: 'sprites',
    color: 'red',
    rgb: COLOR_RED,
    blocks: []
  },
  Animations: {
    id: 'animations',
    color: 'red',
    rgb: COLOR_RED,
    blocks: []
  },
  Groups: {
    id: 'groups',
    color: 'red',
    rgb: COLOR_RED,
    blocks: []
  },
  Data: {
    id: 'data',
    color: 'lightgreen',
    rgb: COLOR_LIGHT_GREEN,
    blocks: []
  },
  Drawing: {
    id: 'drawing',
    color: 'cyan',
    rgb: COLOR_CYAN,
    blocks: []
  },
  Advanced: {
    id: 'advanced',
    color: 'blue',
    rgb: COLOR_BLUE,
    blocks: []
  },
};

module.exports.additionalPredefValues = [
  'Game',
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

/* global dashboard */

var api = require('./apiJavascript.js');
import color from '@cdo/apps/util/color';
import * as audioApi from '@cdo/apps/lib/util/audioApi';
import audioApiDropletConfig from '@cdo/apps/lib/util/audioApiDropletConfig';
import * as timeoutApi from '@cdo/apps/lib/util/timeoutApi';
var getAssetDropdown = require('@cdo/apps/assetManagement/getAssetDropdown');
import {getStore} from '@cdo/apps/redux';

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

exports.injectGameLab = function(gamelab) {
  gameLab = gamelab;
  getAnimationDropdown = gameLab.getAnimationDropdown.bind(gameLab);
  const executeCmd = gameLab.executeCmd.bind(gameLab);
  audioApi.injectExecuteCmd(executeCmd);
  timeoutApi.injectExecuteCmd(executeCmd);
};

// Flip the argument order so we can bind `typeFilter`.
function chooseAsset(typeFilter, callback) {
  dashboard.assets.showAssetManager(callback, typeFilter, null, {
    showUnderageWarning: !getStore().getState().pageConstants.is13Plus
  });
}

module.exports.blocks = [
  // Game Lab
  {
    func: 'draw',
    block: 'function draw() {}',
    expansion: 'function draw() {\n  __;\n}',
    category: 'World',
    noAutocomplete: true
  },
  {func: 'drawSprites', category: 'World'},
  /* disabled since we aren't suggesting these global properties be used - commenting these out prevents droplet from turning 'width' and 'height' into blocks when referenced as locals or parameters */
  //  {func: 'width', category: 'World', type: 'readonlyproperty', noAutocomplete: true },
  //  {func: 'height', category: 'World', type: 'readonlyproperty', noAutocomplete: true },
  {...audioApiDropletConfig.playSound, category: 'World'},
  {...audioApiDropletConfig.stopSound, category: 'World'},
  {...audioApiDropletConfig.playSpeech, category: 'World'},
  {
    func: 'keyIsPressed',
    category: 'World',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {
    func: 'key',
    category: 'World',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {
    func: 'keyCode',
    category: 'World',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {
    func: 'keyDown',
    paletteParams: ['code'],
    params: ['"up"'],
    dropdown: {0: ['"up"', '"down"', '"left"', '"right"', '"space"', '"a"']},
    category: 'World',
    type: 'value'
  },
  {
    func: 'keyWentDown',
    paletteParams: ['code'],
    params: ['"up"'],
    dropdown: {0: ['"up"', '"down"', '"left"', '"right"', '"space"', '"a"']},
    category: 'World',
    type: 'value'
  },
  {
    func: 'keyWentUp',
    paletteParams: ['code'],
    params: ['"up"'],
    dropdown: {0: ['"up"', '"down"', '"left"', '"right"', '"space"', '"a"']},
    category: 'World',
    type: 'value'
  },
  {
    func: 'keyPressed',
    block: 'function keyPressed() {}',
    expansion: 'function keyPressed() {\n  __;\n}',
    category: 'World',
    noAutocomplete: true
  },
  {
    func: 'keyReleased',
    block: 'function keyReleased() {}',
    expansion: 'function keyReleased() {\n  __;\n}',
    category: 'World',
    noAutocomplete: true
  },
  {
    func: 'keyTyped',
    block: 'function keyTyped() {}',
    expansion: 'function keyTyped() {\n  __;\n}',
    category: 'World',
    noAutocomplete: true
  },
  {
    func: 'mouseX',
    category: 'World',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {
    func: 'mouseY',
    category: 'World',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {
    func: 'pmouseX',
    category: 'World',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {
    func: 'pmouseY',
    category: 'World',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {
    func: 'mouseButton',
    category: 'World',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {func: 'mouseDidMove', category: 'World', type: 'value'},
  {
    func: 'mouseDown',
    paletteParams: ['button'],
    params: ['"leftButton"'],
    category: 'World',
    type: 'value'
  },
  {
    func: 'mouseIsPressed',
    category: 'World',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {
    func: 'mouseMoved',
    block: 'function mouseMoved() {}',
    expansion: 'function mouseMoved() {\n  __;\n}',
    category: 'World',
    noAutocomplete: true
  },
  {
    func: 'mouseDragged',
    block: 'function mouseDragged() {}',
    expansion: 'function mouseDragged() {\n  __;\n}',
    category: 'World',
    noAutocomplete: true
  },
  {
    func: 'mousePressed',
    block: 'function mousePressed() {}',
    expansion: 'function mousePressed() {\n  __;\n}',
    category: 'World',
    noAutocomplete: true
  },
  {
    func: 'mouseReleased',
    block: 'function mouseReleased() {}',
    expansion: 'function mouseReleased() {\n  __;\n}',
    category: 'World',
    noAutocomplete: true
  },
  {
    func: 'mouseClicked',
    block: 'function mouseClicked() {}',
    expansion: 'function mouseClicked() {\n  __;\n}',
    category: 'World',
    noAutocomplete: true
  },
  {
    func: 'mouseWentDown',
    paletteParams: ['button'],
    params: ['"leftButton"'],
    category: 'World',
    type: 'value'
  },
  {
    func: 'mouseWentUp',
    paletteParams: ['button'],
    params: ['"leftButton"'],
    category: 'World',
    type: 'value'
  },
  {
    func: 'mouseWheel',
    block: 'function mouseWheel() {}',
    expansion: 'function mouseWheel() {\n  __;\n}',
    category: 'World',
    noAutocomplete: true
  },
  {
    func: 'mouseIsOver',
    paletteParams: ['sprite'],
    params: ['sprite'],
    category: 'World',
    type: 'value'
  },
  {
    func: 'mousePressedOver',
    paletteParams: ['sprite'],
    params: ['sprite'],
    category: 'World',
    type: 'value'
  },
  {
    func: 'showMobileControls',
    paletteParams: [
      'spaceButtonVisible',
      'dpadVisible',
      'dpadFourWay',
      'mobileOnly'
    ],
    params: ['true', 'true', 'true', 'true'],
    category: 'World'
  },
  {
    func: 'allSprites',
    category: 'World',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {func: 'World.allSprites', category: 'World', type: 'readonlyproperty'},
  {func: 'World.width', category: 'World', type: 'readonlyproperty'},
  {func: 'World.height', category: 'World', type: 'readonlyproperty'},
  {func: 'World.mouseX', category: 'World', type: 'readonlyproperty'},
  {func: 'World.mouseY', category: 'World', type: 'readonlyproperty'},
  {func: 'World.frameRate', category: 'World', type: 'property'},
  {func: 'World.frameCount', category: 'World', type: 'readonlyproperty'},
  {func: 'World.seconds', category: 'World', type: 'readonlyproperty'},
  {
    func: 'camera',
    category: 'World',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {func: 'camera.on', category: 'World'},
  {func: 'camera.off', category: 'World'},
  {func: 'camera.isActive', category: 'World', type: 'value'},
  {
    func: 'camera.active',
    category: 'World',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {func: 'camera.mouseX', category: 'World', type: 'readonlyproperty'},
  {func: 'camera.mouseY', category: 'World', type: 'readonlyproperty'},
  {
    func: 'camera.position.x',
    category: 'World',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'camera.position.y',
    category: 'World',
    type: 'property',
    noAutocomplete: true
  },
  {func: 'camera.x', category: 'World', type: 'property'},
  {func: 'camera.y', category: 'World', type: 'property'},
  {func: 'camera.zoom', category: 'World', type: 'property'},
  {
    func: 'comment_GameLab',
    block: '// Comment',
    expansion: '// ',
    category: 'World'
  },

  // Sprites
  {
    func: 'createSprite',
    category: 'Sprites',
    paramButtons: {minArgs: 2, maxArgs: 4},
    paletteParams: ['x', 'y'],
    params: ['200', '200'],
    type: 'either'
  },
  {
    func: 'var sprite = createSprite',
    category: 'Sprites',
    paletteParams: ['x', 'y'],
    params: ['200', '200'],
    noAutocomplete: true,
    docFunc: 'createSprite'
  },
  {
    func: 'changeAnimation',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['label'],
    params: ['"animation_1"'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.changeAnimation',
    noAutocomplete: true
  },
  {
    func: 'setAnimation',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['label'],
    params: ['"animation_1"'],
    dropdown: {
      0: function() {
        return getAnimationDropdown();
      }
    },
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.setAnimation'
  },
  {
    func: 'changeImage',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['label'],
    params: ['"img1"'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.changeImage',
    noAutocomplete: true
  },
  {
    func: 'x',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.x',
    type: 'property'
  },
  {
    func: 'y',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.y',
    type: 'property'
  },
  {
    func: 'velocity',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.velocity',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'velocityX',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.velocityX',
    type: 'property'
  },
  {
    func: 'velocityY',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.velocityY',
    type: 'property'
  },
  {
    func: 'sprite.velocity.x',
    category: 'Sprites',
    modeOptionName: 'sprite_velocity_x',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'sprite.velocity.y',
    category: 'Sprites',
    modeOptionName: 'sprite_velocity_y',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'scale',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.scale',
    type: 'property'
  },
  {
    func: 'sprite.height',
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.height',
    type: 'property'
  },
  {
    func: 'sprite.width',
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.width',
    type: 'property'
  },
  {
    func: 'visible',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.visible',
    type: 'property'
  },
  {
    func: 'rotateToDirection',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.rotateToDirection',
    type: 'property'
  },
  {
    func: 'rotation',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.rotation',
    type: 'property'
  },
  {
    func: 'rotationSpeed',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.rotationSpeed',
    type: 'property'
  },
  {
    func: 'debug',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.debug',
    type: 'property'
  },
  {
    func: 'isTouching',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['target'],
    params: ['target'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.isTouching',
    type: 'value'
  },
  {
    func: 'addAnimation',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['label', 'animation'],
    params: ['"animation_1"', 'anim'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.addAnimation',
    noAutocomplete: true
  },
  {
    func: 'addImage',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['label', 'image'],
    params: ['"img1"', 'img'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.addImage',
    noAutocomplete: true
  },
  {
    func: 'addSpeed',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['speed', 'angle'],
    params: ['1', '90'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.addSpeed'
  },
  {
    func: 'addToGroup',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['group'],
    params: ['group'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.addToGroup',
    noAutocomplete: true
  },
  {
    func: 'bounce',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['target'],
    params: ['target'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.bounce',
    type: 'either'
  },
  {
    func: 'bounceOff',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['target'],
    params: ['target'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.bounceOff',
    type: 'either'
  },
  {
    func: 'collide',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['target'],
    params: ['target'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.collide',
    type: 'either'
  },
  {
    func: 'displace',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['target'],
    params: ['target'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.displace',
    type: 'either'
  },
  {
    func: 'overlap',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['target'],
    params: ['target'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.overlap',
    type: 'either'
  },
  {
    func: 'setCollider',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paramButtons: {minArgs: 1, maxArgs: 6},
    paletteParams: ['type'],
    params: ['"rectangle"'],
    dropdown: {0: colliderTypeDropdown},
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.setCollider'
  },
  {
    func: 'frameDidChange',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.frameDidChange',
    type: 'value'
  },
  {
    func: 'attractionPoint',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['speed', 'x', 'y'],
    params: ['1', '200', '200'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.attractionPoint',
    noAutocomplete: true
  },
  {func: 'createEdgeSprites', category: 'Sprites'},
  {func: 'leftEdge', category: 'Sprites', type: 'readonlyproperty'},
  {func: 'rightEdge', category: 'Sprites', type: 'readonlyproperty'},
  {func: 'bottomEdge', category: 'Sprites', type: 'readonlyproperty'},
  {func: 'topEdge', category: 'Sprites', type: 'readonlyproperty'},
  {func: 'edges', category: 'Sprites', type: 'readonlyproperty'},
  {
    func: 'pause',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.pause'
  },
  {
    func: 'play',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.play'
  },
  {
    func: 'previousFrame',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.previousFrame'
  },
  {
    func: 'nextFrame',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.nextFrame'
  },
  {
    func: 'setFrame',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['frame'],
    params: ['0'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.setFrame'
  },
  {
    func: 'shapeColor',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.shapeColor',
    type: 'property'
  },
  {
    func: 'tint',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.tint',
    type: 'property'
  },
  {
    func: 'alpha',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.alpha',
    type: 'property'
  },
  {
    func: 'setVelocity',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['x', 'y'],
    params: ['1', '1'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.setVelocity'
  },
  {
    func: 'setSpeedAndDirection',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['speed', 'angle'],
    params: ['1', '90'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.setSpeedAndDirection'
  },
  {
    func: 'getAnimationLabel',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.getAnimationLabel',
    type: 'value',
    noAutocomplete: true
  },
  {
    func: 'getDirection',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.getDirection',
    type: 'value'
  },
  {
    func: 'getFrame',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.getFrame',
    type: 'value'
  },
  {
    func: 'getSpeed',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.getSpeed',
    type: 'value'
  },
  {
    func: 'limitSpeed',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['max'],
    params: ['3'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.limitSpeed',
    noAutocomplete: true
  },
  {
    func: 'pointTo',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['x', 'y'],
    params: ['200', '200'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.pointTo'
  },
  {
    func: 'mirrorX',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['dir'],
    params: ['-1'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.mirrorX'
  },
  {
    func: 'mirrorY',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    paletteParams: ['dir'],
    params: ['-1'],
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.mirrorY'
  },
  {
    func: 'getScaledWidth',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.getScaledWidth',
    type: 'value'
  },
  {
    func: 'getScaledHeight',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.getScaledHeight',
    type: 'value'
  },
  {
    func: 'sprite.animation',
    category: 'Sprites',
    modeOptionName: '*.animation',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'depth',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.depth',
    type: 'property'
  },
  {
    func: 'sprite.remove',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: 'sprite_remove',
    noAutocomplete: true
  },
  {
    func: 'destroy',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.destroy'
  },
  {
    func: 'frameDelay',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.frameDelay',
    type: 'property'
  },
  {
    func: 'friction',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.friction',
    type: 'property'
  },
  {
    func: 'immovable',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.immovable',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'life',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.life',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'lifetime',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.lifetime',
    type: 'property'
  },
  {
    func: 'mass',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.mass',
    type: 'property'
  },
  {
    func: 'maxSpeed',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.maxSpeed',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'position',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.position',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'sprite.position.x',
    category: 'Sprites',
    modeOptionName: 'sprite_position_x',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'sprite.position.y',
    category: 'Sprites',
    modeOptionName: 'sprite_position_y',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'previousPosition',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.previousPosition',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'sprite.previousPosition.x',
    category: 'Sprites',
    modeOptionName: 'sprite_previousPosition_x',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'sprite.previousPosition.y',
    category: 'Sprites',
    modeOptionName: 'sprite_previousPosition_y',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'removed',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.removed',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {
    func: 'restitution',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.restitution',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'bounciness',
    category: 'Sprites',
    blockPrefix: spriteBlockPrefix,
    modeOptionName: '*.bounciness',
    type: 'property'
  },
  {
    func: 'touching',
    blockPrefix: spriteBlockPrefix,
    category: 'Sprites',
    tipPrefix: spriteMethodPrefix,
    modeOptionName: '*.touching',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {
    func: 'comment_Sprites',
    block: '// Comment',
    expansion: '// ',
    category: 'Sprites'
  },

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
  {
    func: 'loadAnimation',
    category: 'Animations',
    paletteParams: ['url1', 'url2'],
    params: [
      '"https://code-dot-org.github.io/p5.play/examples/assets/ghost_standing0001.png"',
      '"https://code-dot-org.github.io/p5.play/examples/assets/ghost_standing0002.png"'
    ],
    type: 'either',
    noAutocomplete: true
  },
  {
    func: 'var anim = loadAnimation',
    category: 'Animations',
    paletteParams: ['url1', 'url2'],
    params: [
      '"https://code-dot-org.github.io/p5.play/examples/assets/ghost_standing0001.png"',
      '"https://code-dot-org.github.io/p5.play/examples/assets/ghost_standing0002.png"'
    ],
    noAutocomplete: true,
    docFunc: 'loadAnimation'
  },
  {
    func: 'animation',
    category: 'Animations',
    paletteParams: ['animation', 'x', 'y'],
    params: ['anim', '50', '50'],
    noAutocomplete: true
  },
  {
    func: 'changeFrame',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    paletteParams: ['frame'],
    params: ['0'],
    tipPrefix: animMethodPrefix,
    modeOptionName: '*.changeFrame',
    noAutocomplete: true
  },
  {
    func: 'anim.nextFrame',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    tipPrefix: animMethodPrefix,
    modeOptionName: 'anim_nextFrame',
    noAutocomplete: true
  },
  {
    func: 'anim.previousFrame',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    tipPrefix: animMethodPrefix,
    modeOptionName: 'anim_previousFrame',
    noAutocomplete: true
  },
  {
    func: 'clone',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    tipPrefix: animMethodPrefix,
    modeOptionName: '*.clone',
    type: 'value',
    noAutocomplete: true
  },
  {
    func: 'getFrame',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    tipPrefix: animMethodPrefix,
    modeOptionName: 'anim_getFrame',
    type: 'value',
    noAutocomplete: true
  },
  {
    func: 'getLastFrame',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    tipPrefix: animMethodPrefix,
    modeOptionName: '*.getLastFrame',
    type: 'value',
    noAutocomplete: true
  },
  {
    func: 'goToFrame',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    paletteParams: ['frame'],
    params: ['1'],
    tipPrefix: animMethodPrefix,
    modeOptionName: '*.goToFrame',
    noAutocomplete: true
  },
  {
    func: 'anim.play',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    tipPrefix: animMethodPrefix,
    modeOptionName: 'anim_play',
    noAutocomplete: true
  },
  {
    func: 'rewind',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    tipPrefix: animMethodPrefix,
    modeOptionName: '*.rewind',
    noAutocomplete: true
  },
  {
    func: 'stop',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    tipPrefix: animMethodPrefix,
    modeOptionName: '*.stop',
    noAutocomplete: true
  },
  {
    func: 'frameChanged',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    tipPrefix: animMethodPrefix,
    modeOptionName: '*.frameChanged',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {
    func: 'anim.frameDelay',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    tipPrefix: animMethodPrefix,
    modeOptionName: 'anim_frameDelay',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'images',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    tipPrefix: animMethodPrefix,
    modeOptionName: '*.images',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'looping',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    tipPrefix: animMethodPrefix,
    modeOptionName: '*.looping',
    type: 'property',
    noAutocomplete: true
  },
  {
    func: 'playing',
    blockPrefix: animBlockPrefix,
    category: 'Animations',
    tipPrefix: animMethodPrefix,
    modeOptionName: '*.playing',
    type: 'readonlyproperty',
    noAutocomplete: true
  },
  {
    func: 'anim.visible',
    category: 'Animations',
    modeOptionName: 'anim_visible',
    type: 'property',
    noAutocomplete: true
  },
  /* TODO: decide whether to expose these Animation methods:
draw(xy)
getFrameImage()
getHeight()
getImageAt(frame)
getWidth()
*/

  // Groups
  {func: 'createGroup', category: 'Groups', type: 'either'},
  {
    func: 'var group = createGroup',
    category: 'Groups',
    noAutocomplete: true,
    docFunc: 'createGroup'
  },
  {func: 'Group', category: 'Groups', type: 'either', noAutocomplete: true},
  {
    func: 'var group = new Group',
    category: 'Groups',
    type: 'either',
    docFunc: 'Group',
    noAutocomplete: true
  },
  {
    func: 'add',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['sprite'],
    params: ['sprite'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.add'
  },
  {
    func: 'remove',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['sprite'],
    params: ['sprite'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.remove'
  },
  {
    func: 'clear',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.clear'
  },
  {
    func: 'contains',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['sprite'],
    params: ['sprite'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.contains',
    type: 'value'
  },
  {
    func: 'get',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['i'],
    params: ['0'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.get',
    type: 'value'
  },
  {
    func: 'group.isTouching',
    category: 'Groups',
    paletteParams: ['target'],
    params: ['target'],
    modeOptionName: 'group_isTouching',
    noAutocomplete: true,
    type: 'value'
  } /* avoid sprite.isTouching conflict */,
  {
    func: 'group.bounce',
    category: 'Groups',
    paletteParams: ['target'],
    params: ['target'],
    modeOptionName: 'group_bounce',
    noAutocomplete: true
  } /* avoid sprite.bounce conflict */,
  {
    func: 'group.bounceOff',
    category: 'Groups',
    paletteParams: ['target'],
    params: ['target'],
    modeOptionName: 'group_bounceOff',
    noAutocomplete: true
  } /* avoid sprite.bounceOff conflict */,
  {
    func: 'group.collide',
    category: 'Groups',
    paletteParams: ['target'],
    params: ['target'],
    modeOptionName: 'group_collide',
    noAutocomplete: true
  } /* avoid sprite.collide conflict */,
  {
    func: 'group.displace',
    category: 'Groups',
    paletteParams: ['target'],
    params: ['target'],
    modeOptionName: 'group_displace',
    noAutocomplete: true
  } /* avoid sprite.displace conflict */,
  {
    func: 'group.overlap',
    category: 'Groups',
    paletteParams: ['target'],
    params: ['target'],
    modeOptionName: 'group_overlap',
    noAutocomplete: true
  } /* avoid sprite.overlap conflict */,
  {
    func: 'maxDepth',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.maxDepth',
    type: 'value'
  },
  {
    func: 'minDepth',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.minDepth',
    type: 'value'
  },
  {
    func: 'destroyEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.destroyEach'
  },
  {
    func: 'pointToEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['x', 'y'],
    params: ['200', '200'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.pointToEach'
  },
  {
    func: 'setAnimationEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['label'],
    params: ['"animation_1"'],
    dropdown: {
      0: function() {
        return getAnimationDropdown();
      }
    },
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setAnimationEach'
  },
  {
    func: 'setColorEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['color'],
    params: ['"blue"'],
    dropdown: {
      0: [
        '"red"',
        '"green"',
        '"blue"',
        '"yellow"',
        'rgb(255, 0, 0)',
        'rgb(255, 0, 0, 0.5)'
      ]
    },
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setColorEach'
  },
  {
    func: 'setColliderEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paramButtons: {minArgs: 1, maxArgs: 6},
    paletteParams: ['type'],
    params: ['"rectangle"'],
    dropdown: {0: colliderTypeDropdown},
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setColliderEach'
  },
  {
    func: 'setDepthEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['depth'],
    params: ['1'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setDepthEach'
  },
  {
    func: 'setHeightEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['height'],
    params: ['50'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setHeightEach'
  },
  {
    func: 'setLifetimeEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['lifetime'],
    params: ['5'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setLifetimeEach'
  },
  {
    func: 'setMirrorXEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['dir'],
    params: ['-1'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setMirrorXEach'
  },
  {
    func: 'setMirrorYEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['dir'],
    params: ['-1'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setMirrorYEach'
  },
  {
    func: 'setRotateToDirectionEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['bool'],
    params: ['true'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setRotateToDirectionEach'
  },
  {
    func: 'setRotationEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['angle'],
    params: ['90'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setRotationEach'
  },
  {
    func: 'setRotationSpeedEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['speed'],
    params: ['5'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setRotationSpeedEach'
  },
  {
    func: 'setScaleEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['scale'],
    params: ['5'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setScaleEach'
  },
  {
    func: 'setSpeedAndDirectionEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['speed', 'angle'],
    params: ['1', '90'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setSpeedAndDirectionEach'
  },
  {
    func: 'setTintEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['color'],
    params: ['"blue"'],
    dropdown: {
      0: [
        '"red"',
        '"green"',
        '"blue"',
        '"yellow"',
        'rgb(255, 0, 0)',
        'rgb(255, 0, 0, 0.5)'
      ]
    },
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setTintEach'
  },
  {
    func: 'setVelocityEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['x', 'y'],
    params: ['1', '1'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setVelocityEach'
  },
  {
    func: 'setVelocityXEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['velocityX'],
    params: ['3'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setVelocityXEach'
  },
  {
    func: 'setVelocityYEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['velocityY'],
    params: ['3'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setVelocityYEach'
  },
  {
    func: 'setVisibleEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['bool'],
    params: ['false'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setVisibleEach'
  },
  {
    func: 'setWidthEach',
    blockPrefix: groupBlockPrefix,
    category: 'Groups',
    paletteParams: ['width'],
    params: ['50'],
    tipPrefix: groupMethodPrefix,
    modeOptionName: '*.setWidthEach'
  },
  {
    func: 'comment_Groups',
    block: '// Comment',
    expansion: '// ',
    category: 'Groups'
  },
  /* TODO: decide whether to expose these Group methods:
draw() - USEFUL?
*/

  // Drawing
  {
    func: 'loadImage',
    category: 'Drawing',
    paletteParams: ['url'],
    params: ['"https://code.org/images/logo.png"'],
    type: 'either',
    dropdown: {
      0: function() {
        return getAssetDropdown('image');
      }
    },
    assetTooltip: {0: chooseAsset.bind(null, 'image')}
  },
  {
    func: 'var img = loadImage',
    category: 'Drawing',
    paletteParams: ['url'],
    params: ['"https://code.org/images/logo.png"'],
    noAutocomplete: true
  },
  {
    func: 'image',
    category: 'Drawing',
    paletteParams: [
      'image',
      'srcX',
      'srcY',
      'srcW',
      'srcH',
      'x',
      'y',
      'w',
      'h'
    ],
    params: [
      'img',
      '0',
      '0',
      'img.width',
      'img.height',
      '0',
      '0',
      'img.width',
      'img.height'
    ],
    noAutocomplete: true
  },
  {
    func: 'background',
    category: 'Drawing',
    paletteParams: ['color'],
    params: ['"white"'],
    dropdown: {
      0: [
        '"white"',
        '"red"',
        '"green"',
        '"blue"',
        '"yellow"',
        'rgb(255, 0, 0)',
        'rgb(255, 0, 0, 0.5)'
      ]
    }
  },
  {
    func: 'fill',
    category: 'Drawing',
    paletteParams: ['color'],
    params: ['"yellow"'],
    dropdown: {
      0: [
        '"red"',
        '"green"',
        '"blue"',
        '"yellow"',
        'rgb(255, 0, 0)',
        'rgb(255, 0, 0, 0.5)'
      ]
    }
  },
  {func: 'noFill', category: 'Drawing'},
  {
    func: 'stroke',
    category: 'Drawing',
    paletteParams: ['color'],
    params: ['"blue"'],
    dropdown: {
      0: [
        '"red"',
        '"green"',
        '"blue"',
        '"yellow"',
        'rgb(255, 0, 0)',
        'rgb(255, 0, 0, 0.5)'
      ]
    }
  },
  {func: 'noStroke', category: 'Drawing'},
  {
    func: 'strokeWeight',
    category: 'Drawing',
    paletteParams: ['size'],
    params: ['3']
  },
  {
    func: 'rgb',
    category: 'Drawing',
    paramButtons: {minArgs: 3, maxArgs: 4},
    paletteParams: ['r', 'g', 'b'],
    params: ['255', '255', '255'],
    type: 'value'
  },
  {
    func: 'rect',
    category: 'Drawing',
    paramButtons: {minArgs: 2, maxArgs: 4},
    paletteParams: ['x', 'y', 'w', 'h'],
    params: ['100', '100', '200', '200']
  },
  {
    func: 'ellipse',
    category: 'Drawing',
    paramButtons: {minArgs: 2, maxArgs: 4},
    paletteParams: ['x', 'y', 'w', 'h'],
    params: ['200', '200', '400', '400']
  },
  {
    func: 'text',
    category: 'Drawing',
    paletteParams: ['str', 'x', 'y'],
    params: ['"text"', '0', '15'],
    paramButtons: {minArgs: 3, maxArgs: 5}
  },
  {
    func: 'textAlign',
    category: 'Drawing',
    paletteParams: ['horiz', 'vert'],
    params: ['CENTER', 'TOP']
  },
  {
    func: 'textFont',
    category: 'Drawing',
    paletteParams: ['font'],
    params: ['"Arial"']
  },
  {
    func: 'textSize',
    category: 'Drawing',
    paletteParams: ['pixels'],
    params: ['12']
  },
  {
    func: 'arc',
    category: 'Drawing',
    paletteParams: ['x', 'y', 'w', 'h', 'start', 'stop'],
    params: ['0', '0', '800', '800', '0', '90']
  },
  {
    func: 'line',
    category: 'Drawing',
    paletteParams: ['x1', 'y1', 'x2', 'y2'],
    params: ['0', '0', '400', '400']
  },
  {
    func: 'point',
    category: 'Drawing',
    paletteParams: ['x', 'y'],
    params: ['200', '200']
  },
  {
    func: 'regularPolygon',
    category: 'Drawing',
    paletteParams: ['x', 'y', 'sides', 'size'],
    params: ['200', '200', '5', '50']
  },
  {
    func: 'shape',
    category: 'Drawing',
    paramButtons: {minArgs: 6},
    paletteParams: ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'],
    params: ['200', '0', '0', '400', '400', '400']
  },
  {
    func: 'triangle',
    category: 'Drawing',
    paletteParams: ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'],
    params: ['200', '0', '0', '400', '400', '400'],
    noAutocomplete: true
  },
  {
    func: 'comment_Drawing',
    block: '// Comment',
    expansion: '// ',
    category: 'Drawing'
  },

  // Control
  {...timeoutApi.dropletConfig.setTimeout},
  {...timeoutApi.dropletConfig.clearTimeout},
  {...timeoutApi.dropletConfig.setInterval},
  {...timeoutApi.dropletConfig.clearInterval},
  {...timeoutApi.dropletConfig.timedLoop},
  {...timeoutApi.dropletConfig.stopTimedLoop},
  {
    func: 'comment_Control',
    block: '// Comment',
    expansion: '// ',
    category: 'Control'
  },

  // Math
  {
    func: 'sin',
    category: 'Math',
    paletteParams: ['angle'],
    params: ['0'],
    type: 'value'
  },
  {
    func: 'cos',
    category: 'Math',
    paletteParams: ['angle'],
    params: ['0'],
    type: 'value'
  },
  {
    func: 'tan',
    category: 'Math',
    paletteParams: ['angle'],
    params: ['0'],
    type: 'value'
  },
  {
    func: 'asin',
    category: 'Math',
    paletteParams: ['value'],
    params: ['0'],
    type: 'value'
  },
  {
    func: 'acos',
    category: 'Math',
    paletteParams: ['value'],
    params: ['0'],
    type: 'value'
  },
  {
    func: 'atan',
    category: 'Math',
    paletteParams: ['value'],
    params: ['0'],
    type: 'value'
  },
  {
    func: 'atan2',
    category: 'Math',
    paletteParams: ['y', 'x'],
    params: ['10', '10'],
    type: 'value'
  },
  {
    func: 'degrees',
    category: 'Math',
    paletteParams: ['radians'],
    params: ['0'],
    type: 'value'
  },
  {
    func: 'radians',
    category: 'Math',
    paletteParams: ['degrees'],
    params: ['0'],
    type: 'value'
  },
  {
    func: 'angleMode',
    category: 'Math',
    paletteParams: ['mode'],
    params: ['DEGREES']
  },
  {
    func: 'random',
    category: 'Math',
    paletteParams: ['min', 'max'],
    params: ['1', '5'],
    type: 'value'
  },
  {
    func: 'randomGaussian',
    category: 'Math',
    paletteParams: ['mean', 'sd'],
    params: ['0', '15'],
    type: 'value'
  },
  {
    func: 'randomSeed',
    category: 'Math',
    paletteParams: ['seed'],
    params: ['99']
  },
  {
    func: 'abs',
    category: 'Math',
    paletteParams: ['num'],
    params: ['-1'],
    type: 'value'
  },
  {
    func: 'ceil',
    category: 'Math',
    paletteParams: ['num'],
    params: ['0.1'],
    type: 'value'
  },
  {
    func: 'constrain',
    category: 'Math',
    paletteParams: ['num', 'low', 'high'],
    params: ['1.1', '0', '1'],
    type: 'value'
  },
  {
    func: 'dist',
    category: 'Math',
    paletteParams: ['x1', 'y1', 'x2', 'y2'],
    params: ['0', '0', '100', '100'],
    type: 'value'
  },
  {
    func: 'exp',
    category: 'Math',
    paletteParams: ['num'],
    params: ['1'],
    type: 'value'
  },
  {
    func: 'floor',
    category: 'Math',
    paletteParams: ['num'],
    params: ['0.9'],
    type: 'value'
  },
  {
    func: 'lerp',
    category: 'Math',
    paletteParams: ['start', 'stop', 'amt'],
    params: ['0', '100', '0.1'],
    type: 'value'
  },
  {
    func: 'log',
    category: 'Math',
    paletteParams: ['num'],
    params: ['1'],
    type: 'value'
  },
  {
    func: 'mag',
    category: 'Math',
    paletteParams: ['a', 'b'],
    params: ['100', '100'],
    type: 'value'
  },
  {
    func: 'map',
    category: 'Math',
    paletteParams: ['value', 'start1', 'stop1', 'start2', 'stop'],
    params: ['0.9', '0', '1', '0', '100'],
    type: 'value'
  },
  {
    func: 'max',
    category: 'Math',
    paletteParams: ['n1', 'n2'],
    params: ['1', '3'],
    type: 'value'
  },
  {
    func: 'min',
    category: 'Math',
    paletteParams: ['n1', 'n2'],
    params: ['1', '3'],
    type: 'value'
  },
  {
    func: 'norm',
    category: 'Math',
    paletteParams: ['value', 'start', 'stop'],
    params: ['90', '0', '100'],
    type: 'value'
  },
  {
    func: 'pow',
    category: 'Math',
    paletteParams: ['n', 'e'],
    params: ['10', '2'],
    type: 'value'
  },
  {
    func: 'round',
    category: 'Math',
    paletteParams: ['num'],
    params: ['0.9'],
    type: 'value'
  },
  {
    func: 'sq',
    category: 'Math',
    paletteParams: ['num'],
    params: ['2'],
    type: 'value'
  },
  {
    func: 'sqrt',
    category: 'Math',
    paletteParams: ['num'],
    params: ['9'],
    type: 'value'
  },
  {
    func: 'comment_Math',
    block: '// Comment',
    expansion: '// ',
    category: 'Math'
  },

  // Variables
  {
    func: 'comment_Variables',
    block: '// Comment',
    expansion: '// ',
    category: 'Variables'
  },

  // Data
  {func: 'getUserId', parent: api, category: 'World', noAutocomplete: true},
  {func: 'getKeyValue', parent: api, category: 'World', noAutocomplete: true},
  {func: 'setKeyValue', parent: api, category: 'World', noAutocomplete: true}

  // Advanced
];

module.exports.categories = {
  World: {
    id: 'world',
    color: 'yellow',
    rgb: color.droplet_yellow,
    blocks: []
  },
  Sprites: {
    id: 'sprites',
    color: 'red',
    rgb: color.droplet_red,
    blocks: []
  },
  Animations: {
    id: 'animations',
    color: 'red',
    rgb: color.droplet_red,
    blocks: []
  },
  Groups: {
    id: 'groups',
    color: 'red',
    rgb: color.droplet_red,
    blocks: []
  },
  Data: {
    id: 'data',
    color: 'lightgreen',
    rgb: color.droplet_light_green,
    blocks: []
  },
  Drawing: {
    id: 'drawing',
    color: 'cyan',
    rgb: color.droplet_cyan,
    blocks: []
  },
  Advanced: {
    id: 'advanced',
    color: 'blue',
    rgb: color.droplet_bright_blue,
    blocks: []
  }
};

module.exports.additionalPredefValues = [
  'World',
  'P2D',
  'WEBGL',
  'ARROW',
  'CROSS',
  'HAND',
  'MOVE',
  'TEXT',
  'WAIT',
  'HALF_PI',
  'PI',
  'QUARTER_PI',
  'TAU',
  'TWO_PI',
  'DEGREES',
  'RADIANS',
  'CORNER',
  'CORNERS',
  'RADIUS',
  'RIGHT',
  'LEFT',
  'CENTER',
  'TOP',
  'BOTTOM',
  'BASELINE',
  'POINTS',
  'LINES',
  'TRIANGLES',
  'TRIANGLE_FAN',
  'TRIANGLE_STRIP',
  'QUADS',
  'QUAD_STRIP',
  'CLOSE',
  'OPEN',
  'CHORD',
  'PIE',
  'PROJECT',
  'SQUARE',
  'ROUND',
  'BEVEL',
  'MITER',
  'RGB',
  'HSB',
  'HSL',
  'AUTO',
  'ALT',
  'BACKSPACE',
  'CONTROL',
  'DELETE',
  'DOWN_ARROW',
  'ENTER',
  'ESCAPE',
  'LEFT_ARROW',
  'OPTION',
  'RETURN',
  'RIGHT_ARROW',
  'SHIFT',
  'TAB',
  'UP_ARROW',
  'BLEND',
  'ADD',
  'DARKEST',
  'LIGHTEST',
  'DIFFERENCE',
  'EXCLUSION',
  'MULTIPLY',
  'SCREEN',
  'REPLACE',
  'OVERLAY',
  'HARD_LIGHT',
  'SOFT_LIGHT',
  'DODGE',
  'BURN',
  'THRESHOLD',
  'GRAY',
  'OPAQUE',
  'INVERT',
  'POSTERIZE',
  'DILATE',
  'ERODE',
  'BLUR',
  'NORMAL',
  'ITALIC',
  'BOLD',
  '_DEFAULT_TEXT_FILL',
  '_DEFAULT_LEADMULT',
  '_CTX_MIDDLE',
  'LINEAR',
  'QUADRATIC',
  'BEZIER',
  'CURVE',
  '_DEFAULT_STROKE',
  '_DEFAULT_FILL'
];
module.exports.showParamDropdowns = true;

/*
 * Set the showExamplesLink config value so that the droplet tooltips will show
 * an 'Examples' link that opens documentation in a lightbox:
 */
module.exports.showExamplesLink = true;

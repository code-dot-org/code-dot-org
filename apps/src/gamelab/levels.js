/*jshint multistr: true */

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

// Base config for levels created via levelbuilder
levels.custom = {
  ideal: Infinity,
  requiredBlocks: [],
  scale: {
    'snapRadius': 2
  },
  startBlocks: ''
};

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

levels.ec_sandbox = utils.extend(levels.sandbox, {
  editCode: true,
  codeFunctions: {
    // Game Lab
    "foo": null,
  },
  startBlocks: "",
});

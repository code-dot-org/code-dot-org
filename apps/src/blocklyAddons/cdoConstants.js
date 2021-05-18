export default function initializeCdoConstants(blocklyWrapper) {
  blocklyWrapper.Procedures.DEFINITION_BLOCK_TYPES = [
    'procedures_defnoreturn',
    'procedures_defreturn',
    'functional_definition'
  ];

  blocklyWrapper.BlockValueType = {
    NONE: 'None', // Typically as a connection/input check means "accepts any type"
    STRING: 'String',
    NUMBER: 'Number',
    IMAGE: 'Image',
    BOOLEAN: 'Boolean',
    FUNCTION: 'Function',
    COLOUR: 'Colour',
    ARRAY: 'Array',

    // p5.play Sprite
    SPRITE: 'Sprite',

    /**
     * {Object} Behavior
     * {function} Behavior.func
     * {Array} Behavior.extraArgs
     */
    BEHAVIOR: 'Behavior',

    /**
     * {Object} Location
     * {number} Location.x
     * {number} Location.y
     */
    LOCATION: 'Location'
  };

  // Google Blockly defaults to 28, but Cdo Blockly defaults to 15. Some labs set the snap radius
  // by multiplying a scale factor, so it's important that the default value matches what it was on our fork
  blocklyWrapper.SNAP_RADIUS = 15;
}

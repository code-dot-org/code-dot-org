import {makeEnum} from '@cdo/apps/utils';

import {parseElement as parseXmlElement} from '../xml';

export enum BlocklyVersion {
  CDO = 'CDO',
  GOOGLE = 'Google',
}

export const ToolboxType = makeEnum('CATEGORIZED', 'UNCATEGORIZED', 'NONE');
export const BLOCKLY_THEME = 'blocklyTheme';
export const BLOCKLY_CURSOR = 'blocklyCursor';
export const MenuOptionStates = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  HIDDEN: 'hidden',
};

export enum Themes {
  MODERN = 'cdomodern',
  DARK = 'cdomoderndark',
  HIGH_CONTRAST = 'cdohighcontrast',
  HIGH_CONTRAST_DARK = 'cdohighcontrastdark',
  PROTANOPIA = 'cdoprotanopia',
  PROTANOPIA_DARK = 'cdoprotanopiadark',
  DEUTERANOPIA = 'cdodeuteranopia',
  DEUTERANOPIA_DARK = 'cdodeuteranopiadark',
  TRITANOPIA = 'cdotritanopia',
  TRITANOPIA_DARK = 'cdotritanopiadark',
}

export const DARK_THEME_SUFFIX = 'dark';
export const CLOCKWISE_TURN_DIRECTION = 'turnRight';

export enum BlockStyles {
  DEFAULT = 'default',
  SETUP = 'setup_blocks',
  EVENT = 'event_blocks',
  LOOP = 'loop_blocks',
  LOGIC = 'logic_blocks',
  PROCEDURE = 'procedure_blocks',
  VARIABLE = 'variable_blocks',
  MATH = 'math_blocks',
  TEXT = 'text_blocks',
  COLOR = 'colour_blocks',
  BEHAVIOR = 'behavior_blocks',
}

export const BlockColors = {
  DEFAULT: [184, 1.0, 0.74],
  SETUP: [39, 1.0, 0.99],
  EVENT: [140, 1.0, 0.74],
  LOOP: [322, 0.9, 0.95],
  LOGIC: [196, 1.0, 0.79],
  PROCEDURE: [94, 0.84, 0.6],
  VARIABLE: [312, 0.32, 0.62],
  MATH: [258, 0.35, 0.62],
  TEXT: [160, 0.45, 0.65],
  COLOR: [10, 0.45, 0.65],
  BEHAVIOR: [136, 0.84, 0.8],
  // The colors below do not have a corresponding style and are incompatible with themes.
  COMMENT: [0, 0, 0.6],
  UNKNOWN: [0, 0, 0.8],
  DISABLED: [0, 0, 0.5],
};

export const Renderers = {
  GERAS: 'cdo_renderer_geras',
  THRASOS: 'cdo_renderer_thrasos',
  ZELOS: 'cdo_renderer_zelos',
  DEFAULT: 'cdo_renderer_thrasos',
};

export const NAVIGATION_CURSOR_TYPES = ['default', 'basic', 'line'];
// Used for custom field type ClampedNumber(,)
// Captures two optional arguments from the type string
// Allows:
//   ClampedNumber(x,y)
//   ClampedNumber( x , y )
//   ClampedNumber(,y)
//   ClampedNumber(x,)
//   ClampedNumber(,)
export const CLAMPED_NUMBER_REGEX =
  /^ClampedNumber\(\s*([\d.]*)\s*,\s*([\d.]*)\s*\)$/;

// Used for custom field type FieldButton for 'play sound' block
export const DEFAULT_SOUND = 'sound://category_digital/ping.mp3';

export const NO_OPTIONS_MESSAGE = 'uninitialized';
export const EMPTY_OPTION = '???';
export const WORKSPACE_PADDING = 16;
export const FIELD_IMAGE_DEFAULT_SIZE = 40;

export function stringIsXml(str: string) {
  try {
    JSON.parse(str);
    // If parsed successfully, string is json, not xml.
    return false;
  } catch (e) {
    try {
      parseXmlElement(str);
      // If parsed successfully, string is not xml.
      return true;
    } catch (e) {
      console.warn(`Source string ${str} is neither JSON nor XML.`);
      // String is neither JSON or XML. Default to XML if we can't parse.
      return true;
    }
  }
}

// Removes the usercreated attribute from stringified block XML if it is set to true.
export function stripUserCreated(xmlString: string) {
  return xmlString.replace(/usercreated="true"/gi, '');
}

export enum BLOCK_TYPES {
  argumentReporter = 'argument_reporter',
  behaviorDefinition = 'behavior_definition',
  behaviorGet = 'gamelab_behavior_get',
  colourRandom = 'colour_random',
  danceWhenSetup = 'Dancelab_whenSetup',
  parametersGet = 'parameters_get',
  procedureDefinition = 'procedures_defnoreturn',
  procedureDefinitionReturn = 'procedures_defreturn',
  procedureCall = 'procedures_callnoreturn',
  procedureCallReturn = 'procedures_callreturn',
  procedureIfReturn = 'procedures_ifreturn',
  spriteParameterGet = 'sprite_parameter_get',
  whenRun = 'when_run',
  variableGet = 'variables_get',
  variableSet = 'variables_set',
}

// A list of block types that are procedure definitions. These are sorted
// first when loading blocks so that we can set up the procedure map
// correctly while using the shareable procedure blocks plugin.
export const PROCEDURE_DEFINITION_TYPES: string[] = [
  BLOCK_TYPES.behaviorDefinition,
  BLOCK_TYPES.procedureDefinition,
];

// A list of blocks for getting and setting variables.
export const VARIABLE_BLOCK_TYPES: string[] = [
  BLOCK_TYPES.variableGet,
  BLOCK_TYPES.variableSet,
];
// A list of block types associated with the Run button.
export const SETUP_TYPES = [BLOCK_TYPES.whenRun, BLOCK_TYPES.danceWhenSetup];

export const WORKSPACE_EVENTS = {
  MAIN_BLOCK_SPACE_CREATED: 'mainBlockSpaceCreated',
  EVENT_BLOCKS_IMPORTED: 'blocksImported',
  BLOCK_SPACE_CHANGE: 'blockSpaceChange',
  BLOCK_SPACE_SCROLLED: 'blockSpaceScrolled',
  RUN_BUTTON_CLICKED: 'runButtonClicked',
};

export const READ_ONLY_PROPERTIES = [
  'applab_locale',
  'BasicCursor',
  'Block',
  'blockRendering',
  'blockRendering.ConstantProvider',
  'Blocks',
  'BlockSvg',
  'browserEvents',
  'common',
  'common_locale',
  'ComponentManager',
  'config',
  'Connection',
  'ConnectionType',
  'ContextMenu',
  'contractEditor',
  'createBlockDefinitionsFromJsonArray',
  'createSvgElement',
  'Css',
  'Cursor',
  'dialog',
  'disableVariableEditing',
  'DropDownDiv',
  'Events',
  'Extensions',
  'FieldAngle',
  'FieldAngleInput',
  'FieldColourDropdown',
  'FieldIcon',
  'FieldMultilineInput',
  'FieldRectangularDropdown',
  'fieldRegistry',
  'FieldTextInput',
  'fish_locale',
  'Flyout',
  'FunctionalBlockUtils',
  'FunctionalTypeColors',
  'FunctionEditor',
  'gamelab_locale',
  'Generator',
  'geras',
  'Gesture',
  'getRelativeXY',
  'googlecode',
  'hasCategories',
  'html',
  'Input',
  'INPUT_VALUE',
  'inputTypes',
  'js',
  'MenuItem',
  'MetricsManager',
  'modalBlockSpace',
  'Msg',
  'Names',
  'netsim_locale',
  'Procedures',
  'registry',
  'removeChangeListener',
  'RTL',
  'Scrollbar',
  'serialization',
  'SPRITE',
  'svgResize',
  'thrasos',
  'Toolbox',
  'Touch',
  'Trashcan',
  'tutorialExplorer_locale',
  'useContractEditor',
  'utils',
  'VARIABLE_CATEGORY_NAME',
  'VariableMap',
  'VariableModel',
  'Variables',
  'weblab_locale',
  'WidgetDiv',
  'Workspace',
  'WorkspaceSvg',
  'Xml',
  'zelos',
];

export const SETTABLE_PROPERTIES = [
  'ALIGN_CENTRE',
  'ALIGN_LEFT',
  'ALIGN_RIGHT',
  'assetUrl',
  'behaviorEditor',
  'BROKEN_CONTROL_POINTS',
  'BUMP_UNCONNECTED',
  'customSimpleDialog',
  'FieldParameter',
  'HSV_SATURATION',
  'JavaScript',
  'readOnly',
  'showUnusedBlocks',
  'typeHints',
  'valueTypeTabShapeMap',
];

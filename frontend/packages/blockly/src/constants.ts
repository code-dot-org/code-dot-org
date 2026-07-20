/**
 * Margins for SVG frames for unused blocks and functions
 */
export const frameSizes = {
  MARGIN_SIDE: 15,
  MARGIN_TOP: 10,
  MARGIN_BOTTOM: 5,
  BLOCK_HEADER_HEIGHT: 25,
  WORKSPACE_HEADER_HEIGHT: 50,
};

/**
 * The different renderer keys.
 */
export const Renderers = {
  GERAS: 'cdo_renderer_geras',
  THRASOS: 'cdo_renderer_thrasos',
  ZELOS: 'cdo_renderer_zelos',
  DEFAULT: 'cdo_renderer_thrasos',
};

/**
 * Our custom top-block types.
 */
export const BlockTypes = {
  argumentReporter: 'argument_reporter',
  behaviorDefinition: 'behavior_definition',
  behaviorGet: 'gamelab_behavior_get',
  category: 'category',
  categoryDynamic: 'custom_category',
  colourRandom: 'colour_random',
  danceWhenSetup: 'Dancelab_whenSetup',
  parametersGet: 'parameters_get',
  procedureDefinition: 'procedures_defnoreturn',
  procedureDefinitionReturn: 'procedures_defreturn',
  procedureCall: 'procedures_callnoreturn',
  procedureCallReturn: 'procedures_callreturn',
  procedureIfReturn: 'procedures_ifreturn',
  spriteParameterGet: 'sprite_parameter_get',
  whenRun: 'when_run',
  variableGet: 'variables_get',
  variableSet: 'variables_set',
} as const;

export type BlockTypesKey = (typeof BlockTypes)[keyof typeof BlockTypes];

export const ToolboxType = {
  CATEGORIZED: 'CATEGORIZED',
  UNCATEGORIZED: 'UNCATEGORIZED',
  NONE: 'NONE',
};

export const DEFAULT_CATEGORY_NAME = 'DEFAULT';

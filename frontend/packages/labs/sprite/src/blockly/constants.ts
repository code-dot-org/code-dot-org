// Block style names; each is a block style in every @code-dot-org/blockly
// theme. Ported from apps' blockly/constants.ts.
export const BlockStyles = {
  DEFAULT: 'default',
  SETUP: 'setup_blocks',
  EVENT: 'event_blocks',
  LOOP: 'loop_blocks',
  LOGIC: 'logic_blocks',
  PROCEDURE: 'procedure_blocks',
  VARIABLE: 'variable_blocks',
  MATH: 'math_blocks',
  TEXT: 'text_blocks',
  COLOR: 'colour_blocks',
  BEHAVIOR: 'behavior_blocks',
  SPRITE: 'sprite_blocks',
  LAB_BLOCKS: 'lab_blocks',
} as const;

/** The toolbox-editing marker blocks. */
export const BLOCK_TYPES = {
  category: 'category',
  categoryDynamic: 'custom_category',
} as const;

/** The dynamic categories a toolbox may name, and Blockly's `custom` for each. */
export const DYNAMIC_CATEGORY_OPTIONS: {[key: string]: string} = {
  Functions: 'PROCEDURE',
  Variables: 'VARIABLE',
};

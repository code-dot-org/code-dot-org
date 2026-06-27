import {Order} from 'blockly/javascript';

import {BaseBlocks, Blockly} from '../src';
import type {
  BlockDefinition,
  BlockDefinitions,
  BlocklySerialization,
  Toolbox,
} from '../src';
import {
  RectangleInputPlugin,
  RoundInputPlugin,
  TriangleInputPlugin,
} from '../src/inputs';
import type {Plugin} from '../src/plugins';
import {plugin as blockLimitsPlugin} from '../src/plugins/blockLimits';
import {plugin as disableOrphansPlugin} from '../src/plugins/disableOrphans';
import {plugin as grayOutUndeletableBlocksPlugin} from '../src/plugins/grayOutUndeletableBlocks';
import {plugin as sharableProceduresPlugin} from '../src/plugins/sharableProcedures';
import {plugin as toolboxTrashcanPlugin} from '../src/plugins/toolboxTrashcan';

/**
 * A demo "mode": a self-contained lesson the workspace can be put into. Each
 * bundles the instructions shown on the left (markdown, which may embed inline
 * Blockly previews via `<xml>`), the toolbox offered on the right, the blocks
 * the workspace starts with, and any workspace plugins to install.
 *
 * Switching modes remounts the workspace (see `Demo.tsx`), so each mode is an
 * independent starting point rather than an edit of the previous one.
 */
export interface Mode {
  id: string;
  name: string;
  instructions: string;
  toolbox: Toolbox;
  startBlocks?: BlocklySerialization;
  plugins?: Plugin[];
  /** Custom block definitions to register (beyond the standard Blockly set). */
  blocks?: BlockDefinitions;
}

// A general-purpose toolbox over the standard Blockly blocks (registered by
// `blockly/blocks`, which BlocklyWorkspace imports). Shared by the guided modes;
// free play widens it with variables.
const CORE_TOOLBOX: Toolbox = [
  {
    name: 'Logic',
    blocks: [
      'controls_if',
      'logic_compare',
      'logic_operation',
      'logic_boolean',
    ],
  },
  {
    name: 'Loops',
    blocks: ['controls_repeat_ext', 'controls_whileUntil'],
  },
  {
    name: 'Math',
    blocks: ['math_number', 'math_arithmetic'],
  },
  {
    name: 'Text',
    blocks: ['text', 'text_print'],
  },
];

// A repeat block printing a message — a small stack reused as starting blocks.
const REPEAT_PRINT: BlocklySerialization = {
  blocks: {
    blocks: [
      {
        type: 'controls_repeat_ext',
        x: 48,
        y: 48,
        inputs: {
          TIMES: {shadow: {type: 'math_number', fields: {NUM: 5}}},
          DO: {
            block: {
              type: 'text_print',
              inputs: {
                TEXT: {shadow: {type: 'text', fields: {TEXT: 'Hello!'}}},
              },
            },
          },
        },
      },
    ],
  },
};

// Blocks for the "Typed sockets" mode. Blocks only declare a plain type string
// (`output` on value blocks, `check` on the consumer's sockets); Blockly's
// checker uses those strings to decide what connects to what. The connection
// *shape* for each type is defined separately by an input plugin supplied via
// the mode's `plugins` (see `INPUT_SHAPE_PLUGINS` below), so an output and a
// socket drawn for the same type share a notch without either block knowing
// about the renderer.
const NUMBER_TYPE = 'Number';
const BOOLEAN_TYPE = 'Boolean';
const STRING_TYPE = 'String';

// Binds each type string to a notch shape. Registered once, at the workspace
// level, rather than per block.
const INPUT_SHAPE_PLUGINS: Plugin[] = [
  RectangleInputPlugin(NUMBER_TYPE),
  RoundInputPlugin(BOOLEAN_TYPE),
  TriangleInputPlugin(STRING_TYPE),
];

// Number value — rectangle notch.
const demoNumber: BlockDefinition = {
  type: 'demo_number',
  style: 'math_blocks',
  tooltip: 'A number value — rectangle notch (Number).',
  helpUrl: '',
  output: NUMBER_TYPE,
  message0: 'number %1',
  args0: [{type: 'field_number', name: 'NUM', value: 42}],
  generator: {
    javascript: block => [String(block.getFieldValue('NUM')), Order.ATOMIC],
  },
};

// Boolean value — round notch.
const demoBoolean: BlockDefinition = {
  type: 'demo_boolean',
  style: 'logic_blocks',
  tooltip: 'A boolean value — round notch (Boolean).',
  helpUrl: '',
  output: BOOLEAN_TYPE,
  message0: 'boolean %1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'BOOL',
      options: [
        ['true', 'TRUE'],
        ['false', 'FALSE'],
      ],
    },
  ],
  generator: {
    javascript: block => [
      block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false',
      Order.ATOMIC,
    ],
  },
};

// Text value — triangle notch.
const demoText: BlockDefinition = {
  type: 'demo_text',
  style: 'text_blocks',
  tooltip: 'A text value — triangle notch (String).',
  helpUrl: '',
  output: STRING_TYPE,
  message0: 'text %1',
  args0: [{type: 'field_input', name: 'TEXT', text: 'hi'}],
  generator: {
    javascript: block => [
      JSON.stringify(block.getFieldValue('TEXT')),
      Order.ATOMIC,
    ],
  },
};

// Consumer with one socket per type. Each `check` matches a value block's
// output type, so the socket draws that type's notch and rejects the others.
const demoConsumer: BlockDefinition = {
  type: 'demo_consumer',
  style: 'procedure_blocks',
  tooltip: 'Each socket only accepts a block whose shape it shares.',
  helpUrl: '',
  message0: 'count %1 flag %2 label %3',
  args0: [
    {type: 'input_value', name: 'NUM', check: NUMBER_TYPE, align: 'RIGHT'},
    {type: 'input_value', name: 'FLAG', check: BOOLEAN_TYPE, align: 'RIGHT'},
    {type: 'input_value', name: 'LABEL', check: STRING_TYPE, align: 'RIGHT'},
  ],
  generator: {
    javascript: (block, generator) => {
      const num = generator.valueToCode(block, 'NUM', Order.NONE);
      const flag = generator.valueToCode(block, 'FLAG', Order.NONE);
      const label = generator.valueToCode(block, 'LABEL', Order.NONE);
      return `display(${num || '0'}, ${flag || 'false'}, ${label || '""'});\n`;
    },
  },
};

export const modes: Mode[] = [
  {
    id: 'loops',
    name: 'Loops',
    instructions: [
      '## Repeat a block',
      '',
      'A **loop** runs the same blocks several times. Drag a repeat block',
      'into the workspace and set how many times it should run.',
      '',
      '<xml>',
      '<block type="controls_repeat_ext"></block>',
      '</xml>',
      '',
      'Put a print block inside the loop to show a message on every pass.',
    ].join('\n'),
    toolbox: CORE_TOOLBOX,
    startBlocks: REPEAT_PRINT,
  },
  {
    id: 'conditionals',
    name: 'Conditionals',
    instructions: [
      '## Make a decision',
      '',
      'An **if** block runs the blocks inside it only when its condition is',
      'true.',
      '',
      '<xml>',
      '<block type="controls_if"></block>',
      '</xml>',
      '',
      'Compare two numbers, then print a message when they match.',
    ].join('\n'),
    toolbox: CORE_TOOLBOX,
    startBlocks: {
      blocks: {
        blocks: [
          {
            type: 'controls_if',
            x: 48,
            y: 48,
            inputs: {
              IF0: {
                block: {
                  type: 'logic_compare',
                  fields: {OP: 'EQ'},
                  inputs: {
                    A: {shadow: {type: 'math_number', fields: {NUM: 1}}},
                    B: {shadow: {type: 'math_number', fields: {NUM: 1}}},
                  },
                },
              },
              DO0: {
                block: {
                  type: 'text_print',
                  inputs: {
                    TEXT: {shadow: {type: 'text', fields: {TEXT: 'Equal!'}}},
                  },
                },
              },
            },
          },
        ],
      },
    },
  },
  {
    id: 'inputShapes',
    name: 'Typed sockets',
    instructions: [
      '## Typed sockets and connection shapes',
      '',
      'Each value block has an **output type** that decides both its connection',
      '**shape** and what it is allowed to plug into:',
      '',
      '- `number` — a **rectangle** notch (`Number`)',
      '- `boolean` — a **round** notch (`Boolean`)',
      '- `text` — a **triangle** notch (`String`)',
      '',
      'The consumer block has one socket per type, each drawn in the matching',
      'shape. A value block only drops into a socket whose shape it shares:',
      'drag the loose `boolean` onto the rectangular `count` socket and Blockly',
      'refuses the connection.',
      '',
      'Blocks only name the type (a plain `output`/`check` string, which is what',
      'Blockly checks); the shape for each type comes from an **input plugin**',
      'installed via this mode’s `plugins`. Swap the filled blocks between',
      'sockets to see which the checker accepts.',
    ].join('\n'),
    blocks: [demoNumber, demoBoolean, demoText, demoConsumer],
    plugins: INPUT_SHAPE_PLUGINS,
    toolbox: [
      {name: 'Values', blocks: ['demo_number', 'demo_boolean', 'demo_text']},
      {name: 'Consumer', blocks: ['demo_consumer']},
    ],
    startBlocks: {
      blocks: {
        blocks: [
          {
            type: 'demo_consumer',
            x: 48,
            y: 48,
            inputs: {
              NUM: {block: {type: 'demo_number', fields: {NUM: 7}}},
              FLAG: {block: {type: 'demo_boolean', fields: {BOOL: 'TRUE'}}},
              LABEL: {block: {type: 'demo_text', fields: {TEXT: 'score'}}},
            },
          },
          {type: 'demo_number', x: 96, y: 220, fields: {NUM: 3}},
          {type: 'demo_boolean', x: 96, y: 270, fields: {BOOL: 'FALSE'}},
          {type: 'demo_text', x: 96, y: 320, fields: {TEXT: 'hi'}},
        ],
      },
    },
  },
  {
    id: 'trashcan',
    name: 'Trashcan plugin',
    instructions: [
      '## Delete blocks with the trashcan',
      '',
      'This mode installs the **toolbox trashcan** plugin. Drag a block from',
      'the workspace toward the toolbox on the left: a trashcan appears, and',
      'dropping the block on it deletes the block.',
      '',
      'Try removing the starting blocks.',
    ].join('\n'),
    toolbox: CORE_TOOLBOX,
    startBlocks: REPEAT_PRINT,
    plugins: [toolboxTrashcanPlugin],
  },
  {
    id: 'blockLimits',
    name: 'Block limits plugin',
    instructions: [
      '## Limit how many blocks are used',
      '',
      'This mode installs the **block limits** plugin. Blocks in the flyout',
      'can carry a usage limit; a small indicator shows how many remain.',
      '',
      'Drag out copies and watch the remaining count fall toward zero.',
    ].join('\n'),
    // A flyout (single, always-open category) so the per-block remaining-count
    // indicators are visible without opening a category. Limits ride on each
    // block's `extraState.limit`, which the plugin reads from the toolbox.
    toolbox: {
      name: 'Limited blocks',
      blocks: [
        {kind: 'block', type: 'controls_repeat_ext', extraState: {limit: 2}},
        {kind: 'block', type: 'controls_if', extraState: {limit: 1}},
        {kind: 'block', type: 'text_print', extraState: {limit: 3}},
        {kind: 'block', type: 'math_number'},
        {kind: 'block', type: 'text'},
      ],
    },
    plugins: [blockLimitsPlugin],
  },
  {
    id: 'grayOutUndeletable',
    name: 'Gray-out plugin',
    instructions: [
      '## Locked blocks',
      '',
      'This mode installs the **gray-out undeletable blocks** plugin. A block',
      'marked undeletable (but still movable) is drawn gray, signaling it is a',
      'fixed part of the program.',
      '',
      'The repeat block below is locked; the print inside it is not.',
    ].join('\n'),
    toolbox: CORE_TOOLBOX,
    startBlocks: {
      blocks: {
        blocks: [
          {
            type: 'controls_repeat_ext',
            x: 48,
            y: 48,
            deletable: false,
            inputs: {
              TIMES: {shadow: {type: 'math_number', fields: {NUM: 4}}},
              DO: {
                block: {
                  type: 'text_print',
                  inputs: {
                    TEXT: {
                      shadow: {type: 'text', fields: {TEXT: 'Locked loop'}},
                    },
                  },
                },
              },
            },
          },
        ],
      },
    },
    plugins: [grayOutUndeletableBlocksPlugin],
  },
  {
    id: 'disableOrphans',
    name: 'Disable-orphans plugin',
    instructions: [
      '## Connect to "when run"',
      '',
      'This mode installs the **disable orphans** plugin. Blocks that are not',
      'attached beneath the `when run` hat are disabled and faded.',
      '',
      'Drag the loose print block onto the stack to enable it — or pull a block',
      'off the stack to watch it fade.',
    ].join('\n'),
    blocks: [BaseBlocks.when_run],
    toolbox: [{name: 'Events', blocks: ['when_run']}, ...CORE_TOOLBOX],
    startBlocks: {
      blocks: {
        blocks: [
          {
            type: 'when_run',
            x: 48,
            y: 48,
            next: {
              block: {
                type: 'text_print',
                inputs: {
                  TEXT: {shadow: {type: 'text', fields: {TEXT: 'Connected!'}}},
                },
              },
            },
          },
          {
            type: 'text_print',
            x: 80,
            y: 180,
            inputs: {
              TEXT: {shadow: {type: 'text', fields: {TEXT: 'Orphan'}}},
            },
          },
        ],
      },
    },
    plugins: [disableOrphansPlugin],
  },
  {
    id: 'sharableProcedures',
    name: 'Sharable procedures plugin',
    instructions: [
      '## Functions',
      '',
      'This mode installs the **sharable procedures** plugin — a *global*',
      'plugin (the others are inject plugins) that swaps in function blocks',
      'whose definitions can be copied between workspaces.',
      '',
      'A function is already defined. Open the **Functions** category: a call',
      'block for it appears there alongside the definition blocks. Drag the',
      'call into the workspace, or define another function.',
    ].join('\n'),
    // A dynamic category: Blockly regenerates the flyout from the workspace's
    // procedure map each time it opens, so a call block appears for every
    // function defined (the define blocks themselves are always offered).
    toolbox: [
      {
        name: 'Functions',
        key: 'PROCEDURE',
        onLoad: workspace => Blockly.Procedures.flyoutCategory(workspace),
      },
      {name: 'Text', blocks: ['text', 'text_print']},
    ],
    startBlocks: {
      blocks: {
        blocks: [
          {
            type: 'procedures_defnoreturn',
            x: 48,
            y: 48,
            fields: {NAME: 'greet'},
            inputs: {
              STACK: {
                block: {
                  type: 'text_print',
                  inputs: {
                    TEXT: {shadow: {type: 'text', fields: {TEXT: 'Hi!'}}},
                  },
                },
              },
            },
          },
        ],
      },
    },
    plugins: [sharableProceduresPlugin],
  },
  {
    id: 'freeplay',
    name: 'Free play',
    instructions: [
      '## Free play',
      '',
      'The full toolbox is on the right. Drag out any blocks and experiment —',
      'this mode has no starting blocks.',
    ].join('\n'),
    toolbox: [
      ...CORE_TOOLBOX,
      {
        name: 'Variables',
        blocks: ['variables_get', 'variables_set'],
      },
    ],
  },
  {
    // Spike: validate dragging a block from a BlocklyFlyout in the (separate,
    // scrolling) sidebar into the main workspace. Demo.tsx renders this mode with
    // a BlocklyProvider and a BlocklyFlyout in place of the usual instructions.
    id: 'flyoutSpike',
    name: 'Flyout spike',
    // Demonstrates BlocklyMarkdown's draggable mode: the embedded <xml> blocks
    // render as a flyout the reader can drag — or keyboard-place — into the
    // workspace. Demo.tsx renders this mode's instructions with `draggable`
    // inside a BlocklyProvider so the flyout can target the main workspace.
    instructions: [
      '## Drag from the instructions',
      '',
      'Drag a block below into the workspace, or use the keyboard: Tab to the',
      'palette, arrow keys to move between blocks, Enter to place the focused',
      'block, Escape to leave.',
      '',
      '<xml>',
      '<block type="when_run"></block>',
      '<block type="controls_repeat_ext"></block>',
      '<block type="controls_if"></block>',
      '<block type="text_print"></block>',
      '</xml>',
    ].join('\n'),
    toolbox: [], // blocks come from the draggable instructions, not a toolbox
    blocks: [BaseBlocks.when_run],
    startBlocks: {
      blocks: {blocks: [{type: 'when_run', x: 48, y: 48}]},
    },
  },
];

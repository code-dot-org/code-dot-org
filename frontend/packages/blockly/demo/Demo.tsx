import {useState} from 'react';

import {
  BlocklyWorkspace,
  RectangleInputPlugin,
  RoundInputPlugin,
  TriangleInputPlugin,
} from '../src';
import type {BlockDefinitions, BlocklySerialization, Toolbox} from '../src';
import {themeOptions, themes} from '../src/themes';

import moduleStyles from './demo.module.css';

// Blockly's own blocks, which `BlocklyWorkspace` registers by importing
// `blockly/blocks`.
const TOOLBOX: Toolbox = [
  {
    name: 'Logic',
    blocks: [
      'controls_if',
      'logic_compare',
      'logic_operation',
      'logic_boolean',
    ],
  },
  {name: 'Loops', blocks: ['controls_repeat_ext', 'controls_whileUntil']},
  {name: 'Math', blocks: ['math_number', 'math_arithmetic']},
  {name: 'Text', blocks: ['text', 'text_print']},
  {
    name: 'Shapes',
    blocks: ['demo_place', 'demo_sprite', 'demo_behavior', 'demo_location'],
  },
];

// Sprite Lab's custom types, notched as apps notches them (inputs.md).
const SHAPE_PLUGINS = [
  TriangleInputPlugin('Sprite'),
  RoundInputPlugin('Behavior'),
  RectangleInputPlugin('Location'),
];

const valueBlock = (type: string, output: string, style: string) => ({
  type,
  tooltip: '',
  message0: output.toLowerCase(),
  output,
  style,
  generator: {javascript: () => [`'${type}'`, 0] as [string, number]},
});

const BLOCKS: BlockDefinitions = [
  valueBlock('demo_sprite', 'Sprite', 'sprite_blocks'),
  valueBlock('demo_behavior', 'Behavior', 'behavior_blocks'),
  valueBlock('demo_location', 'Location', 'location_blocks'),
  {
    type: 'demo_place',
    tooltip: '',
    message0: 'give %1 %2 at %3',
    args0: [
      {type: 'input_value', name: 'SPRITE', check: 'Sprite'},
      {type: 'input_value', name: 'BEHAVIOR', check: 'Behavior'},
      {type: 'input_value', name: 'LOCATION', check: 'Location'},
    ],
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    style: 'sprite_blocks',
    generator: {javascript: () => ''},
  },
];

const START_BLOCKS: BlocklySerialization = {
  blocks: {
    blocks: [
      {
        type: 'controls_repeat_ext',
        x: 20,
        y: 20,
        inputs: {
          TIMES: {shadow: {type: 'math_number', fields: {NUM: 3}}},
          DO: {
            block: {
              type: 'text_print',
              inputs: {TEXT: {shadow: {type: 'text', fields: {TEXT: 'Hi'}}}},
            },
          },
        },
      },
    ],
  },
};

/** One editable workspace, for trying the package by hand. */
export const Demo = () => {
  const [themeName, setThemeName] = useState<string>(themeOptions[0].value);
  const [dark, setDark] = useState(false);
  // Each theme a menu offers has a dark variant named `<name>-dark`.
  const theme = themes[dark ? `${themeName}-dark` : themeName];

  return (
    <div className={moduleStyles.app}>
      <header className={moduleStyles.header}>
        <h1 className={moduleStyles.title}>@code-dot-org/blockly</h1>
        <label>
          Theme{' '}
          <select
            value={themeName}
            onChange={event => setThemeName(event.target.value)}
          >
            {themeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={dark}
            onChange={event => setDark(event.target.checked)}
          />{' '}
          Dark
        </label>
      </header>
      <main className={moduleStyles.canvas}>
        <BlocklyWorkspace
          blocks={BLOCKS}
          plugins={SHAPE_PLUGINS}
          toolbox={TOOLBOX}
          startBlocks={START_BLOCKS}
          theme={theme}
        />
      </main>
    </div>
  );
};

export default Demo;

import {useState} from 'react';

import {BlocklyWorkspace} from '../src';
import type {BlocklySerialization, Toolbox} from '../src';
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
          toolbox={TOOLBOX}
          startBlocks={START_BLOCKS}
          theme={theme}
        />
      </main>
    </div>
  );
};

export default Demo;

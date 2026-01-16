import type * as Blockly from 'blockly/core';
import classNames from 'classnames';

import simple2Toolbox from './simple2';

import {BlockMode} from '../../constants';

import moduleStyles from './toolbox.module.scss';

const baseCategoryCssConfig = {
  container: moduleStyles.toolboxCategoryContainer,
  row: classNames(moduleStyles.toolboxRow, 'blocklyTreeRow'),
  label: moduleStyles.toolboxLabel,
};

// Convert a simple toolbox array into a blockly toolbox info
const convert: (map: {
  [key: string]: string[];
}) => Blockly.utils.toolbox.ToolboxInfo = map => ({
  kind: 'categoryToolbox',
  contents: Object.entries(map).map(([name, blocks]) => ({
    kind: 'category',
    name,
    cssconfig: baseCategoryCssConfig,
    contents: blocks.map(type => ({
      kind: 'block',
      type,
    })),
  })),
});

const map = {
  [BlockMode.SIMPLE2]: convert(simple2Toolbox),
} as const;

export default map;

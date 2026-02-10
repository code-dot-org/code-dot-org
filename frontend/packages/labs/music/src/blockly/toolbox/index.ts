import type {ToolboxCategory} from '@code-dot-org/blockly-workspace';
import classNames from 'classnames';

import simple2Toolbox from './simple2';

import {BlockMode} from '../../constants';

import moduleStyles from './toolbox.module.scss';

const baseCategoryCssConfig = {
  container: moduleStyles.toolboxCategoryContainer,
  row: classNames(moduleStyles.toolboxRow, 'blocklyTreeRow'),
  label: moduleStyles.toolboxLabel,
};

// Imbed css and craft toolboxes
const map: {
  [key: string]: ToolboxCategory[];
} = {
  [BlockMode.SIMPLE2]: simple2Toolbox.map(info => ({
    ...info,
    cssconfig: baseCategoryCssConfig,
  })),
} as const;

export * from './types';
export * from './constants';

export default map;

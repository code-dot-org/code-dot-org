// The lab's own modules, re-exported for a page to import at runtime.
//
// Vite rewrites bare specifiers when it TRANSFORMS a module, so a dynamic
// `import('blockly/core')` typed into the page console resolves nothing. A
// file the server transforms can import them normally, which is all this is.

import * as Blockly from 'blockly/core';

import {buildDomainPalette} from '../../src/blockly/domainBlocks';
import {parseRuleMeta} from '../../src/blockly/ruleMeta';
import {STOCK_RULES} from '../../src/rules/stock';

import {countBlocks, interfaceOnly} from './interfaceOnly.mjs';

export {
  Blockly,
  STOCK_RULES,
  buildDomainPalette,
  countBlocks,
  interfaceOnly,
  parseRuleMeta,
};

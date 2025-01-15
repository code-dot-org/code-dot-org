// This file exports customized blocks for CDO Blockly labs.

import {blocks as commonBlocks} from './commonBlocks';
import {blocks as playlabBlocks} from './playlabBlocks';
import {blocks as spritelabBlocks} from './spritelabBlocks';

export default {
  ...commonBlocks,
  ...playlabBlocks,
  ...spritelabBlocks,
};

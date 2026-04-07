import * as Blockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';

export const simpleGenerator = new Blockly.Generator('simple');

// Inherit javascriptGenerator functionality
simpleGenerator.scrub_ = javascriptGenerator.scrub_;
simpleGenerator.INDENT = javascriptGenerator.INDENT;

import {blocks as procedureBlocks} from '@blockly/block-shareable-procedures';
import type {BlocklySerialization, Environment} from '@code-dot-org/blockly';
import {Driver as BlocklyDriver} from '@code-dot-org/blockly';
import ThrasosRenderer from '@code-dot-org/blockly/renderers/thrasos';
import DefaultTheme from '@code-dot-org/blockly/themes/default';
import * as Blockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';

import {BlockTypes} from './blockly/blockTypes';
import musicBlocks from './blockly/blocks/simple2';
import type {BlockModeType} from './constants';
import type {ExecutionErrorHandler, PlaybackExecutionData} from './execution';
import {executeWhenRun} from './execution';
import Generator from './Generator';

let blocklyDriver: BlocklyDriver | undefined;

// Registry.registerProcedures redefines every shareable-procedure type.
const touchedTypes = (): string[] => [
  ...new Set([
    ...musicBlocks.map(block => block.type),
    ...Object.keys(procedureBlocks),
  ]),
];

type Snapshot = {
  type: string;
  block?: (typeof Blockly.Blocks)[string];
  generator?: (typeof javascriptGenerator.forBlock)[string];
  hadBlock: boolean;
  hadGenerator: boolean;
};

function snapshot(types: string[]): Snapshot[] {
  return types.map(type => ({
    type,
    block: Blockly.Blocks[type],
    generator: javascriptGenerator.forBlock[type],
    hadBlock: Object.prototype.hasOwnProperty.call(Blockly.Blocks, type),
    hadGenerator: Object.prototype.hasOwnProperty.call(
      javascriptGenerator.forBlock,
      type,
    ),
  }));
}

function restore(snapshots: Snapshot[]) {
  for (const {type, block, generator, hadBlock, hadGenerator} of snapshots) {
    if (hadBlock) {
      Blockly.Blocks[type] = block!;
    } else {
      delete Blockly.Blocks[type];
    }
    if (hadGenerator) {
      javascriptGenerator.forBlock[type] = generator!;
    } else {
      delete javascriptGenerator.forBlock[type];
    }
  }
}

// With no procedure serializer, a caller finds its definition only if it loaded first.
function definitionsFirst(source: BlocklySerialization): BlocklySerialization {
  const blocks = source.blocks?.blocks;
  if (!blocks) {
    return source;
  }
  const isDefinition = (block: {type: string}) =>
    block.type === BlockTypes.FUNCTION_DEFINITION;
  return {
    ...source,
    blocks: {
      ...source.blocks,
      blocks: [
        ...blocks.filter(isDefinition),
        ...blocks.filter(block => !isDefinition(block)),
      ],
    },
  };
}

/** Music's blocks are registered only during the call, so a host lab's survive. */
export function compileSongHeadless(
  source: BlocklySerialization,
  blockMode: BlockModeType,
  onError: ExecutionErrorHandler,
): PlaybackExecutionData {
  // Block init reads Blockly.Msg; a host that never injected a workspace has none.
  if (Blockly.Msg['UNNAMED_KEY'] === undefined) {
    Blockly.setLocale(En as unknown as {[key: string]: string});
  }

  const saved = snapshot(touchedTypes());
  const workspace = new Blockly.Workspace();
  try {
    // Never deconstructed: that resets generator state the host's Driver shares.
    blocklyDriver ||= new BlocklyDriver(
      {} as Environment,
      ThrasosRenderer,
      DefaultTheme,
    );
    blocklyDriver.setBlocks(musicBlocks);

    Blockly.serialization.workspaces.load(definitionsFirst(source), workspace);
    const generator = new Generator(
      {},
      workspace,
      javascriptGenerator,
      blockMode,
      {},
    );
    return executeWhenRun(generator, blockMode, onError);
  } finally {
    workspace.dispose();
    restore(saved);
  }
}

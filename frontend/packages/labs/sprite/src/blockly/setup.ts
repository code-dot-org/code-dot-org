// The lab-owned blocks as @code-dot-org/blockly definitions, for a workspace's
// `blocks`. Their fields, extension and mutator travel with them and register
// with the workspace. Apps' setup.ts also installed the legacy Sprite Lab
// blocks and the level's DB block pool; those wait on the engine
// (docs/port-plan.md).

import type {BlockDefinition} from '@code-dot-org/blockly';

import labBlockDefinitions from './blockDefinitions';

export const SPRITELAB2_BLOCKS: BlockDefinition[] = labBlockDefinitions.map(
  ({definition, generator}) =>
    ({
      tooltip: '',
      ...definition,
      generator: {javascript: generator},
    }) as BlockDefinition,
);

import {BlockDefinition} from '@cdo/apps/blockly/types';

/**
 * Returns the list of option keys for a given dropdown field in a block.
 */
export default function (
  blocks: BlockDefinition[],
  name: string,
  field: string
) {
  return (
    blocks
      .find(block => block.name === name)
      ?.config?.args?.find(arg => arg.name === field)
      ?.options?.map(([_, key]) => key) || []
  );
}

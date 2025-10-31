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

export function getBlockOptionsDancers(
  blocks: BlockDefinition[],
  name: string,
  field: string
): (string | [string, string])[] | undefined {
  return blocks
    .find(block => block.name === name)
    ?.config?.args?.find(arg => arg.name === field)?.options as
    | (string | [string, string])[]
    | undefined;
}

export function getBlockOptionsNumbers(
  blocks: BlockDefinition[],
  name: string,
  field: string
): (string | [string, string])[] | undefined {
  return blocks
    .find(block => block.name === name)
    ?.config?.args?.find(arg => arg.name === field)
    ?.options?.map(([key]) => key) as (string | [string, string])[] | undefined;
}

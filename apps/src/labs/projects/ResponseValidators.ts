import {ResponseValidator} from '@cdo/apps/util/HttpClient';
import {BlocklySource, SourceResponse} from '../types';

export const SourceResponseValidator: ResponseValidator<
  SourceResponse
> = response => {
  if (!response.source) {
    throw new Error('Missing required field: source');
  }

  // Currently only Blockly JSON sources are supported.
  const blocklySource = JSON.parse(response.source as string) as BlocklySource;
  if (blocklySource.blocks === undefined) {
    throw new Error('Missing required field: blocks');
  }

  if (blocklySource.variables === undefined) {
    throw new Error('Missing required field: variables');
  }

  return response as SourceResponse;
};

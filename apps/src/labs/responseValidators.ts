import {ResponseValidator} from '@cdo/apps/util/HttpClient';
import {BlocklySource, ProjectSources} from './types';

export const SourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  const projectSources = response as ProjectSources;
  if (!projectSources.source) {
    throw new Error('Missing required field: source');
  }

  // Currently only Blockly JSON sources are supported.
  const blocklySource = JSON.parse(projectSources.source) as BlocklySource;
  if (blocklySource.blocks === undefined) {
    throw new Error('Missing required field: blocks');
  }

  if (blocklySource.variables === undefined) {
    throw new Error('Missing required field: variables');
  }

  return projectSources;
};

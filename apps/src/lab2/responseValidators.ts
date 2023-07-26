import {ResponseValidator} from '@cdo/apps/util/HttpClient';
import {BlocklySource, ProjectSources} from './types';

export const SourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  const projectSources = response as ProjectSources;
  if (!projectSources.source) {
    throw new ValidationError('Missing required field: source');
  }

  // Currently only Blockly JSON sources are supported.
  let blocklySource;
  try {
    blocklySource = JSON.parse(projectSources.source) as BlocklySource;
  } catch (e) {
    throw new ValidationError('Error parsing JSON: ' + e);
  }
  if (blocklySource.blocks === undefined) {
    throw new ValidationError('Missing required field: blocks');
  }

  return projectSources;
};

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';

    // Needed for TypeScript to register this class correctly in ES5
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

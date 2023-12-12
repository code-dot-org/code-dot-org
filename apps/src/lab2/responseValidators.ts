import {ResponseValidator} from '@cdo/apps/util/HttpClient';
import {BlocklySource, LevelProperties, ProjectSources} from './types';

export const SourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  if (!response.source) {
    throw new ValidationError('Missing required field: source');
  }

  // Currently only Blockly JSON sources are supported.
  let blocklySource;
  try {
    blocklySource = JSON.parse(response.source as string) as BlocklySource;
  } catch (e) {
    throw new ValidationError('Error parsing JSON: ' + e);
  }
  if (blocklySource.blocks === undefined) {
    throw new ValidationError('Missing required field: blocks');
  }

  return response as unknown as ProjectSources;
};

export const LevelPropertiesValidator: ResponseValidator<
  LevelProperties
> = response => {
  if (!response.appName) {
    throw new ValidationError('Missing required field: appName');
  }

  // Convert stringified booleans to actual booleans.
  for (const key of Object.keys(response)) {
    if (response[key] === 'true') {
      response[key] = true;
    }
    if (response[key] === 'false') {
      response[key] = false;
    }
  }

  return response as unknown as LevelProperties;
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

import {ResponseValidator} from '@cdo/apps/util/HttpClient';
import {AppName, BlocklySource, LevelProperties, ProjectSources} from './types';
import Lab2Registry from './Lab2Registry';

export const BlocklySourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  if (!response.source) {
    throw new ValidationError('Missing required field: source');
  }

  // Currently Blockly JSON sources and python sources with a "main.py" are supported.
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

export const PythonSourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  if (!response.source) {
    throw new ValidationError('Missing required field: source');
  }

  let pythonSource;
  try {
    pythonSource = JSON.parse(response.source as string);
  } catch (e) {
    throw new ValidationError('Error parsing JSON: ' + e);
  }
  if (!pythonSource['main.py']) {
    throw new ValidationError('Missing required field: main.py');
  }

  return response as unknown as ProjectSources;
};

export const DefaultSourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  if (!response.source) {
    throw new ValidationError('Missing required field: source');
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

export function setValidatorForAppType(appName: AppName) {
  if (appName === 'pythonlab') {
    Lab2Registry.getInstance().setSourceResponseValidator(
      PythonSourceResponseValidator
    );
  } else {
    // otherwise assume blockly
    Lab2Registry.getInstance().setSourceResponseValidator(
      BlocklySourceResponseValidator
    );
  }
}

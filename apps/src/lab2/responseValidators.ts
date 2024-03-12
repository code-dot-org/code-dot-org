import {ResponseValidator} from '@cdo/apps/util/HttpClient';
import {AppName, BlocklySource, LevelProperties, ProjectSources} from './types';
import Lab2Registry from './Lab2Registry';
import {BLOCKLY_LABS} from './constants';
import {NestedSourceCode} from '@cdo/apps/pythonlab/pythonlabRedux';

// Validator for Blockly sources.
export const BlocklySourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  const blocklyValidator = (source: string) => {
    const blocklySource = parseJSON<BlocklySource>(source);
    if (blocklySource.blocks === undefined) {
      throwMissingFieldError('blocks');
    }
  };

  return sourceValidatorHelper(response, blocklyValidator);
};

// Validator for Python sources.
export const PythonSourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  const pythonValidator = (source: string) => {
    const pythonSource = parseJSON<NestedSourceCode>(source);
    // TODO: support a nested main.py
    if (!pythonSource['main.py']) {
      throwMissingFieldError('main.py');
    }
  };
  return sourceValidatorHelper(response, pythonValidator);
};

// Default source validator. This just checks if there is a source field.
export const DefaultSourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  return sourceValidatorHelper(response, () => {});
};

export const LevelPropertiesValidator: ResponseValidator<
  LevelProperties
> = response => {
  if (!response.appName) {
    throwMissingFieldError('appName');
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
  const registry = Lab2Registry.getInstance();
  if (appName === 'pythonlab') {
    registry.setSourceResponseValidator(PythonSourceResponseValidator);
  } else if (BLOCKLY_LABS.includes(appName)) {
    // Blockly labs
    registry.setSourceResponseValidator(BlocklySourceResponseValidator);
  } else {
    // Everything else uses the default validator
    registry.setSourceResponseValidator(DefaultSourceResponseValidator);
  }
}

function sourceValidatorHelper(
  response: Record<string, unknown>,
  appSpecificValidator: (source: string) => void
): ProjectSources {
  if (!response.source) {
    throwMissingFieldError('source');
  }
  appSpecificValidator(response.source as string);
  return response as unknown as ProjectSources;
}

function parseJSON<T>(source: string) {
  try {
    return JSON.parse(source) as T;
  } catch (e) {
    throw new ValidationError('Error parsing JSON: ' + e);
  }
}

function throwMissingFieldError(fieldName: string) {
  throw new ValidationError('Missing required field: ' + fieldName);
}

import {ResponseValidator} from '@cdo/apps/util/HttpClient';
import {
  BlocklySource,
  LevelProperties,
  MultiFileSource,
  ProjectSources,
} from './types';
import Lab2Registry from './Lab2Registry';
import {BLOCKLY_LABS} from './constants';

// Validator for Blockly sources.
const BlocklySourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  const blocklyValidator = (responseToValidate: Record<string, unknown>) => {
    // Blockly sources are always stringified JSON.
    let blocklySource;
    try {
      blocklySource = JSON.parse(
        responseToValidate.source as string
      ) as BlocklySource;
    } catch (e) {
      throw new ValidationError('Error parsing JSON: ' + e);
    }
    if (blocklySource.blocks === undefined) {
      throwMissingFieldError('blocks');
    }
  };

  return sourceValidatorHelper(response, blocklyValidator);
};

// Validator for Python sources.
const PythonSourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  const pythonValidator = (responseToValidate: Record<string, unknown>) => {
    if (typeof responseToValidate.source === 'string') {
      throw new ValidationError('Python sources must be a JSON object');
    }
    const source = responseToValidate.source as MultiFileSource;
    if (!source?.files || !source.folders) {
      throw new ValidationError('Invalid source code');
    }
  };
  return sourceValidatorHelper(response, pythonValidator);
};

// Default source validator. This just checks if there is a source field.
const DefaultSourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  return sourceValidatorHelper(response, () => {});
};

export const SourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  const appName = Lab2Registry.getInstance().getAppName();
  if (appName === 'pythonlab') {
    return PythonSourceResponseValidator(response);
  } else if (appName !== null && BLOCKLY_LABS.includes(appName)) {
    // Blockly labs
    return BlocklySourceResponseValidator(response);
  } else {
    // Everything else uses the default validator
    return DefaultSourceResponseValidator(response);
  }
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

function sourceValidatorHelper(
  response: Record<string, unknown>,
  appSpecificValidator: (response: Record<string, unknown>) => void
): ProjectSources {
  if (!response.source) {
    throwMissingFieldError('source');
  }
  appSpecificValidator(response);
  return response as unknown as ProjectSources;
}

function throwMissingFieldError(fieldName: string) {
  throw new ValidationError('Missing required field: ' + fieldName);
}

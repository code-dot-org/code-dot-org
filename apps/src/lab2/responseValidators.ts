import {ResponseValidator} from '@cdo/apps/util/HttpClient';

import {BLOCKLY_LABS, LABS_WITH_JSON_SOURCES} from './constants';
import Lab2Registry from './Lab2Registry';
import {
  BlocklySource,
  LevelProperties,
  MultiFileSource,
  ProjectSources,
} from './types';

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

// Validator for Codebridge sources.
const CodebridgeSourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  const codebridgeValidator = (responseToValidate: Record<string, unknown>) => {
    if (typeof responseToValidate.source === 'string') {
      throw new ValidationError('Codebridge sources must be a JSON object');
    }
    const source = responseToValidate.source as MultiFileSource;
    if (!source?.files || !source.folders) {
      throw new ValidationError('Invalid source code');
    }
  };
  return sourceValidatorHelper(response, codebridgeValidator);
};

// Validator for non-Blockly labs that use JSON sources
const JsonSourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  const jsonValidator = (responseToValidate: Record<string, unknown>) => {
    try {
      JSON.parse(responseToValidate.source as string);
    } catch (e) {
      throw new ValidationError('Error parsing JSON: ' + e);
    }
  };

  return sourceValidatorHelper(response, jsonValidator);
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
  if (appName === 'pythonlab' || appName === 'weblab2') {
    return CodebridgeSourceResponseValidator(response);
  } else if (appName !== null && BLOCKLY_LABS.includes(appName)) {
    // Blockly labs
    return BlocklySourceResponseValidator(response);
  } else if (appName !== null && LABS_WITH_JSON_SOURCES.includes(appName)) {
    return JsonSourceResponseValidator(response);
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

import {ResponseValidator} from '@cdo/apps/util/HttpClient';
import {AppName, BlocklySource, LevelProperties, ProjectSources} from './types';
import Lab2Registry from './Lab2Registry';
import {BLOCKLY_LABS} from './constants';

// Validator for Blockly sources.
export const BlocklySourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  validateSourceField(response);

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

// Validator for Python sources.
export const PythonSourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  validateSourceField(response);

  let pythonSource;
  try {
    pythonSource = JSON.parse(response.source as string);
  } catch (e) {
    throw new ValidationError('Error parsing JSON: ' + e);
  }
  // TODO: support a nested main.py
  if (!pythonSource['main.py']) {
    throw new ValidationError('Missing required field: main.py');
  }

  return response as unknown as ProjectSources;
};

// Default source validator. This just checks if there is a source field.
export const DefaultSourceResponseValidator: ResponseValidator<
  ProjectSources
> = response => {
  validateSourceField(response);

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
  } else if (BLOCKLY_LABS.includes(appName)) {
    // Blockly labs
    Lab2Registry.getInstance().setSourceResponseValidator(
      BlocklySourceResponseValidator
    );
  } else {
    // Everything else uses the default validator
    Lab2Registry.getInstance().setSourceResponseValidator(
      DefaultSourceResponseValidator
    );
  }
}

function validateSourceField(response: Record<string, unknown>) {
  if (!response.source) {
    throw new ValidationError('Missing required field: source');
  }
}

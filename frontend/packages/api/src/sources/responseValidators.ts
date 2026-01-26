import type {AppName} from '../projects/types';
import type {ResponseValidator} from '../types';
import ValidationError from '../ValidationError';

import {LABS_WITH_JSON_SOURCES} from './constants';
import {MultiFileSource, ProjectSources} from './types';

function missingFieldError(fieldName: string) {
  return new ValidationError('Missing required field: ' + fieldName);
}

function sourceValidatorHelper(
  response: Record<string, unknown> | unknown[],
  appSpecificValidator: (response: Record<string, unknown>) => void,
): ProjectSources {
  if (Array.isArray(response)) {
    throw new Error('Source response should be an object (received array).');
  }
  if (!response.source) {
    throw missingFieldError('source');
  }
  appSpecificValidator(response);
  return response as unknown as ProjectSources;
}

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

export const SourceResponseValidator: (
  appName: AppName,
) => ResponseValidator<ProjectSources> = appName => response => {
  if (appName === 'pythonlab' || appName === 'weblab2') {
    return CodebridgeSourceResponseValidator(response);
  } else if (appName !== null && LABS_WITH_JSON_SOURCES.includes(appName)) {
    return JsonSourceResponseValidator(response);
  } else {
    // Everything else uses the default validator
    return DefaultSourceResponseValidator(response);
  }
};

import type {ResponseValidator} from '@code-dot-org/api';
import {ValidationError} from '@code-dot-org/api';

import {LevelProperties} from './types';

function missingFieldError(fieldName: string) {
  return new ValidationError('Missing required field: ' + fieldName);
}

export const LevelPropertiesValidator: ResponseValidator<
  LevelProperties
> = response => {
  if (Array.isArray(response)) {
    throw new Error('Level properties should be an object (received array).');
  }
  if (!response.appName) {
    throw missingFieldError('appName');
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

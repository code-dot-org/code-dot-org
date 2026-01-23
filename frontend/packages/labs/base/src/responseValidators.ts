import type {ResponseValidator} from '@code-dot-org/api';
import {ValidationError} from '@code-dot-org/api';

import {LevelProperties, LevelPropertiesMap} from './types';

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

export const LevelPropertiesMapValidator: ResponseValidator<
  LevelPropertiesMap
> = response => {
  if (Array.isArray(response)) {
    throw new Error(
      'Level properties map should be an object (received array).',
    );
  }

  for (const levelId of Object.keys(response)) {
    const properties = response[levelId] as Record<string, unknown>;
    if (typeof properties !== 'object' || properties === null) {
      throw new Error(
        `Level properties should be an object (received ${typeof properties}).`,
      );
    }
    if (Array.isArray(properties)) {
      throw new Error('Level properties should be an object (received array).');
    }
    if (!properties.appName) {
      throw missingFieldError('appName');
    }

    // Convert stringified booleans to actual booleans.
    for (const key of Object.keys(properties)) {
      if (properties[key] === 'true') {
        properties[key] = true;
      }
      if (properties[key] === 'false') {
        properties[key] = false;
      }
    }
  }

  return response as unknown as LevelPropertiesMap;
};

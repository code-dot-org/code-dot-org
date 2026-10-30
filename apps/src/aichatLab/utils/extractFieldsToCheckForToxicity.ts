import {AiCustomizations, ToxicityCheckedField} from '../types';
import {FIELDS_CHECKED_FOR_TOXICITY} from '../views/modelCustomization/constants';

/**
 * Extracts fields from AiCustomizations that need to be checked for toxicity.
 */
export const extractFieldsToCheckForToxicity = (
  customizations: AiCustomizations
) => {
  return FIELDS_CHECKED_FOR_TOXICITY.reduce((acc, field) => {
    if (customizations[field]) {
      acc[field] = customizations[field];
    }
    return acc;
  }, {} as {[key in ToxicityCheckedField]: string | string[]});
};

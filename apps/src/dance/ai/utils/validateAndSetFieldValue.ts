import {FieldDropdown} from 'blockly';
import {FieldKey} from '@cdo/apps/dance/ai/types';

type ValidateAndSetFieldValueLogger = (o: {
  message: string;
  value: string;
  field: FieldKey;
}) => void;

type ValidateAndSetFieldValueOptions = {
  logger?: ValidateAndSetFieldValueLogger;
};

type ValidateAndSetFieldValueFunction = (
  dropdown: FieldDropdown,
  value: string,
  field: FieldKey,
  options?: ValidateAndSetFieldValueOptions
) => void;

// partial application of valdiateAndSetField. Given a logger function, returns
// a validateAndSetFieldValue function with that logger.
export function getValidateAndSetFieldValueWithInvalidValueLogger(
  logger: ValidateAndSetFieldValueLogger
) {
  const f: ValidateAndSetFieldValueFunction = (
    dropdown,
    value,
    field,
    options = {}
  ) => validateAndSetFieldValue(dropdown, value, field, {logger, ...options});

  return f;
}

// given a dropdown, a value, and a field, sets the value in the drop down.
// optionally logs information if the value is not in the dropdown and a logger
// is provided in options.
export const validateAndSetFieldValue: ValidateAndSetFieldValueFunction =
  function (dropdown, value, field, {logger} = {}) {
    if (
      dropdown
        .getOptions()
        .some(option => option[1] === value || option[1] === `"${value}"`)
    ) {
      dropdown.setValue(value);
    } else {
      logger?.({
        message: 'Invalid generated value',
        value,
        field,
      });
    }
  };

import {FieldDropdown} from 'blockly';
import {FieldKey} from '@cdo/apps/dance/ai/types';

type ValidateAndSetFieldValueLogger = (o: {
  message: string;
  value: string;
  field: FieldKey;
}) => void;

type ValidateAndSetFieldValueOptions = {
  invalidValueLogger?: ValidateAndSetFieldValueLogger;
};

type ValidateAndSetFieldValueFunction = (
  dropdown: FieldDropdown,
  value: string,
  field: FieldKey,
  options?: ValidateAndSetFieldValueOptions
) => void;

// partial application of valdiateAndSetField. Given a invalidValueLogger function, returns
// a validateAndSetFieldValue function with that invalidValueLogger.
export function getValidateAndSetFieldValueWithInvalidValueLogger(
  invalidValueLogger: ValidateAndSetFieldValueLogger
) {
  const f: ValidateAndSetFieldValueFunction = (
    dropdown,
    value,
    field,
    options = {}
  ) =>
    validateAndSetFieldValue(dropdown, value, field, {
      invalidValueLogger,
      ...options,
    });

  return f;
}

// given a dropdown, a value, and a field, sets the value in the drop down.
// optionally logs information if the value is not in the dropdown and a invalidValueLogger
// is provided in options.
export const validateAndSetFieldValue: ValidateAndSetFieldValueFunction =
  function (dropdown, value, field, {invalidValueLogger} = {}) {
    if (
      dropdown
        .getOptions()
        .some(option => option[1] === value || option[1] === `"${value}"`)
    ) {
      dropdown.setValue(value);
    } else {
      invalidValueLogger?.({
        message: 'Invalid generated value',
        value,
        field,
      });
    }
  };

import {FieldDropdown} from 'blockly';

export type ValidateAndSetFieldValueLogger = (o: {
  message: string;
  value: string;
  logValues?: unknown;
}) => void;

export type ValidateAndSetFieldValueOptions = {
  logValues?: unknown;
  invalidValueLogger?: ValidateAndSetFieldValueLogger;
};

type ValidateAndSetFieldValueFunction = (
  dropdown: FieldDropdown,
  value: string,
  options?: ValidateAndSetFieldValueOptions
) => void;

// partial application of valdiateAndSetField. Given a invalidValueLogger function, returns
// a validateAndSetFieldValue function with that invalidValueLogger.
export function getValidateAndSetFieldValueWithInvalidValueLogger(
  invalidValueLogger: ValidateAndSetFieldValueLogger
) {
  const f: ValidateAndSetFieldValueFunction = (dropdown, value, options = {}) =>
    validateAndSetFieldValue(dropdown, value, {
      invalidValueLogger,
      ...options,
    });

  return f;
}

// given a dropdown, a value, and a field, sets the value in the drop down.
// optionally logs information if the value is not in the dropdown and a invalidValueLogger
// is provided in options.
export const validateAndSetFieldValue: ValidateAndSetFieldValueFunction =
  function (dropdown, value, {invalidValueLogger, logValues} = {}) {
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
        logValues,
      });
    }
  };

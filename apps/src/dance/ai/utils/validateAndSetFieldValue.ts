import {FieldDropdown} from 'blockly';
import {FieldKey} from '@cdo/apps/dance/ai/types';

import Lab2MetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';

export function validateAndSetFieldValue(
  dropdown: FieldDropdown,
  value: string,
  field: FieldKey
) {
  if (
    dropdown
      .getOptions()
      .some(option => option[1] === value || option[1] === `"${value}"`)
  ) {
    dropdown.setValue(value);
  } else {
    Lab2MetricsReporter.logWarning({
      message: 'Invalid generated value',
      value,
      field,
    });
  }
}

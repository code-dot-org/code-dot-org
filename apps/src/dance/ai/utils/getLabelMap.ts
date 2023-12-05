import {FieldDropdown} from 'blockly';

// The keys are English-only (eg, "blooming_petals"),
// and values is user readable / translated string (eg, "Blooming Petals").
// Example: {'blooming_petals': 'Blooming Petals'}
export const getLabelMap = (
  dropdown: FieldDropdown
): {[id: string]: string} => {
  const options = dropdown.getOptions();

  const map: {[id: string]: string} = {};
  options.forEach(option => {
    if (!(typeof option[0] === 'string')) {
      return;
    }

    // Keys from blockly are surrounded in double quotes
    // eg, '"blooming_petals"'. Remove them for easier use.
    const id = option[1].replace(/"/g, '');

    map[id] = option[0];
  });
  return map;
};

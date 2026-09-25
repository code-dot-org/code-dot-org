// A vector in an inspector: the direction dial with the length beside it, and
// the arrow grid behind a click — the `vector` block field, with a property
// behind it instead of a block (`DialInput`).

import {
  VectorEditor,
  vectorLabel,
  type VectorValue,
} from '../blockly/fields/VectorEditor';

import {DialInput} from './DialInput';

export interface VectorInputProps {
  /** The control's `name`, as a text field's would be. */
  name: string;
  label: string;
  value: VectorValue;
  disabled?: boolean;
  /** Every change, as the grid is dragged — discrete, like a checkbox. */
  onChange: (value: VectorValue) => void;
}

export const VectorInput = ({
  name,
  label,
  value,
  disabled,
  onChange,
}: VectorInputProps) => (
  <DialInput
    name={name}
    label={label}
    text={vectorLabel(value)}
    // A vector of no length points nowhere, and the dial draws a dot.
    radians={
      value.x !== 0 || value.y !== 0 ? Math.atan2(value.y, value.x) : undefined
    }
    ariaValue={`x ${value.x}, y ${value.y}`}
    disabled={disabled}
  >
    <VectorEditor value={value} onChange={onChange} />
  </DialInput>
);

export default VectorInput;

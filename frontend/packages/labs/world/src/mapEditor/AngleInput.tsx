// An angle in an inspector: the direction dial with the degrees beside it, and
// the ring of common angles behind a click — the `angle` block field, with a
// property behind it instead of a block (`DialInput`).

import {
  AngleEditor,
  angleLabel,
  normalizeAngle,
} from '../blockly/fields/AngleEditor';

import {DialInput} from './DialInput';

export interface AngleInputProps {
  /** The control's `name`, as a text field's would be. */
  name: string;
  label: string;
  /** Degrees, clockwise from east. */
  value: number;
  disabled?: boolean;
  /** Every change, as the dial is dragged — discrete, like a checkbox. */
  onChange: (degrees: number) => void;
}

export const AngleInput = ({
  name,
  label,
  value,
  disabled,
  onChange,
}: AngleInputProps) => (
  <DialInput
    name={name}
    label={label}
    text={angleLabel(value)}
    // Always a direction: unlike a vector, every angle is one — zero degrees
    // points east rather than nowhere.
    radians={(normalizeAngle(value) * Math.PI) / 180}
    ariaValue={`${normalizeAngle(value)} degrees`}
    disabled={disabled}
  >
    <AngleEditor value={value} onChange={onChange} />
  </DialInput>
);

export default AngleInput;

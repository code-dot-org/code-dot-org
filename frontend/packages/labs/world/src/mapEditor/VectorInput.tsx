// A vector in an inspector, shown the way a block shows one: the direction
// dial with the length beside it, and the arrow grid behind a click.
//
// The dial is the block face's own (`blockly/fields/dialPreview`) and the grid
// is the block field's own popup (`blockly/fields/VectorEditor`), so a vector
// looks and edits the same whether it is met in a program or in the map
// editor. What differs is only what is behind it: a field on a block there,
// a property's text here, which the caller writes (`WorldInspector`).

import {Popover} from '@mui/material';
import {useEffect, useRef, useState} from 'react';

import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';

import {dialWidth, renderDial} from '../blockly/fields/dialPreview';
import {VectorEditor, type VectorValue} from '../blockly/fields/VectorEditor';

import styles from './mapEditor.module.css';

export interface VectorInputProps {
  /** The control's `name`, as a text field's would be. */
  name: string;
  label: string;
  value: VectorValue;
  disabled?: boolean;
  /** Every change, as the grid is dragged — discrete, like a checkbox. */
  onChange: (value: VectorValue) => void;
}

/** The dial's height on a block, which is the height it is drawn at here. */
const DIAL_HEIGHT = 18;

/** The vector's length, rounded, as the block face writes it beside the dial. */
const magnitude = (value: VectorValue): string =>
  String(Math.round(Math.hypot(value.x, value.y) * 10) / 10);

export const VectorInput = ({
  name,
  label,
  value,
  disabled,
  onChange,
}: VectorInputProps) => {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const dialRef = useRef<SVGSVGElement>(null);
  const width = dialWidth(magnitude(value));

  // The dial draws itself into a bare element, the way a block field is handed
  // one, so it is drawn again from scratch whenever the value changes.
  useEffect(() => {
    const element = dialRef.current;
    if (!element) {
      return;
    }
    element.replaceChildren();
    renderDial({
      element,
      width,
      height: DIAL_HEIGHT,
      radians:
        value.x !== 0 || value.y !== 0
          ? Math.atan2(value.y, value.x)
          : undefined,
      label: magnitude(value),
    });
  }, [value.x, value.y, width]);

  return (
    <FormFieldWrapper label={label} size="s" className={styles.inspectorVector}>
      <button
        type="button"
        name={name}
        className={styles.inspectorDial}
        disabled={disabled}
        aria-label={`${label}: x ${value.x}, y ${value.y}`}
        aria-haspopup="dialog"
        aria-expanded={anchor !== null}
        onClick={event => setAnchor(event.currentTarget)}
      >
        <svg ref={dialRef} width={width + 2} height={DIAL_HEIGHT + 2} />
      </button>
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        slotProps={{paper: {className: styles.inspectorDialPopover}}}
      >
        <VectorEditor value={value} onChange={onChange} />
      </Popover>
    </FormFieldWrapper>
  );
};

export default VectorInput;

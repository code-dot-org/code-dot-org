// A direction in an inspector, shown the way a block shows one: the dial the
// block face draws, with a word beside it, and the block field's own popup
// behind a click.
//
// The dial is `blockly/fields/dialPreview`, which both the vector and the
// angle field draw with; the popup is whichever editor the caller puts inside
// (`VectorInput`, `AngleInput`). So a direction looks and edits the same
// whether it is met in a program or in the map editor, and what differs is
// only what is behind it: a field on a block there, a property here.

import {Popover} from '@mui/material';
import {useEffect, useRef, useState, type ReactNode} from 'react';

import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';

import {dialWidth, renderDial} from '../blockly/fields/dialPreview';

import styles from './mapEditor.module.css';

export interface DialInputProps {
  /** The control's `name`, as a text field's would be. */
  name: string;
  label: string;
  /** The word beside the dial: a length, an angle. */
  text: string;
  /**
   * Which way the arrow points, clockwise from east with `+y` down, as the
   * engine has it. Undefined draws a dot: a vector of no length.
   */
  radians: number | undefined;
  /** The value, said for a screen reader. */
  ariaValue: string;
  disabled?: boolean;
  /** The editor the popover holds. */
  children: ReactNode;
}

/** The dial's height on a block, which is the height it is drawn at here. */
const DIAL_HEIGHT = 18;

export const DialInput = ({
  name,
  label,
  text,
  radians,
  ariaValue,
  disabled,
  children,
}: DialInputProps) => {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const dialRef = useRef<SVGSVGElement>(null);
  const width = dialWidth(text);

  // The dial draws itself into a bare element, the way a block field is handed
  // one, so it is drawn again from scratch whenever the value changes.
  useEffect(() => {
    const element = dialRef.current;
    if (!element) {
      return;
    }
    element.replaceChildren();
    renderDial({element, width, height: DIAL_HEIGHT, radians, label: text});
  }, [radians, text, width]);

  return (
    <FormFieldWrapper label={label} size="s" className={styles.inspectorVector}>
      <button
        type="button"
        name={name}
        className={styles.inspectorDial}
        disabled={disabled}
        aria-label={`${label}: ${ariaValue}`}
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
        {children}
      </Popover>
    </FormFieldWrapper>
  );
};

export default DialInput;

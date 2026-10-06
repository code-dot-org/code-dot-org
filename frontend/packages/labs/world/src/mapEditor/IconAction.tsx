// One of the inspector's actions, as an icon: Code, Enhance, Open, Delete.
//
// THE WORDS ARE STILL THERE, as its accessible name and as the tooltip a
// pointer finds, because an icon alone says less than the button it replaced:
// "Enhance Coin…" names the kind that a tick will change, and a screen reader
// or a lesson pointing at the button needs that sentence and not a sparkle.
//
// The icons are the ones these actions already wear elsewhere, so a learner
// meets one picture per idea: the sparkles on a `define actor` block and in
// the file menu, the box-and-arrow on a block that names a file, the trash can
// every list in the lab deletes with.

import {IconButton, Tooltip} from '@mui/material';
import type {HTMLAttributes} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

export interface IconActionProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'color'> {
  /** What it does, in words: the accessible name and the tooltip. */
  label: string;
  /** The FontAwesome icon. */
  icon: string;
  disabled?: boolean;
  /** Where a lesson's "show me" rings it (`callouts/places`). */
  'data-callout'?: string;
}

export const IconAction = ({
  label,
  icon,
  disabled,
  ...rest
}: IconActionProps) => (
  <Tooltip title={label}>
    {/* A disabled button fires no pointer events, so the tooltip listens
        on a wrapper that does. */}
    <span>
      <IconButton
        aria-label={label}
        size="extraSmall"
        color="tertiary"
        variant="text"
        disabled={disabled}
        {...rest}
      >
        <FontAwesomeV6Icon iconName={icon} iconStyle="solid" />
      </IconButton>
    </span>
  </Tooltip>
);

export default IconAction;

import {Tooltip} from '@mui/material';
import type {FunctionComponent, ReactNode} from 'react';
import {useEffect, useState} from 'react';

import {useTheme} from '@code-dot-org/component-library/common/contexts';

import moduleStyles from './pixel-editor.module.scss';

// Added to the theme's 8px caret gap for 25px total, so the tail reads
// against the image rather than the dark toolbar gap.
const GAP_PX = 17;
// Left-column triggers sit a 34px column + 4px gap further out; the extra
// distance lands every bubble on the same x.
const LEFT_COLUMN_GAP_PX = GAP_PX + 38;

// Popper re-initializes on a new modifiers identity, so build these once.
const offsetBy = (gap: number) => [
  {name: 'offset', options: {offset: [0, gap]}},
];
const MODIFIERS = offsetBy(GAP_PX);
const LEFT_COLUMN_MODIFIERS = offsetBy(LEFT_COLUMN_GAP_PX);

// The editor toolbar's tooltip: to the right, quick to hide.
const PixelTooltip: FunctionComponent<{
  tooltipId: string;
  text: string;
  fromLeftColumn?: boolean;
  children: ReactNode;
}> = ({tooltipId, text, fromLeftColumn, children}) => {
  // The bubble portals to <body>, outside the modal host that carries
  // data-theme, so it has to be set on the bubble itself.
  const {theme} = useTheme(true);
  const [open, setOpen] = useState(false);

  // Leaving the window mid-hover swallows the mouseleave, so the bubble would
  // stay up until the next hover.
  useEffect(() => {
    const hide = () => setOpen(false);
    window.addEventListener('blur', hide);
    return () => window.removeEventListener('blur', hide);
  }, []);

  return (
    <Tooltip
      id={tooltipId}
      title={text}
      placement="right"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      leaveDelay={10}
      disableInteractive
      slotProps={{
        popper: {
          modifiers: fromLeftColumn ? LEFT_COLUMN_MODIFIERS : MODIFIERS,
        },
        ...(theme ? {tooltip: {'data-theme': theme}} : {}),
      }}
    >
      {/* Every toolbar control can be disabled, and a disabled button fires
          no pointer events; the span is what the tooltip listens on. */}
      <span className={moduleStyles.tooltipAnchor}>{children}</span>
    </Tooltip>
  );
};

export default PixelTooltip;

import {Tooltip} from '@mui/material';
import React, {useEffect, useState} from 'react';

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

const PixelTooltip: React.FunctionComponent<{
  tooltipId: string;
  text: string;
  fromLeftColumn?: boolean;
  children: React.ReactElement;
}> = ({tooltipId, text, fromLeftColumn, children}) => {
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
      }}
    >
      {children}
    </Tooltip>
  );
};

export default PixelTooltip;

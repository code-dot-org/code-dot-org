import {Tooltip} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import moduleStyles from './pixel-editor.module.scss';

// Tooltip preconfigured for the editor's toolbar: opens to the right, hides
// quickly, and lifts above the modal overlay (see .pixelTooltip). fromLeftColumn
// compensates for the trigger sitting one toolbar column further from the
// canvas, so every bubble lands on the same x.
const PixelTooltip: React.FunctionComponent<{
  tooltipId: string;
  text: string;
  fromLeftColumn?: boolean;
  children: React.ReactElement;
}> = ({tooltipId, text, fromLeftColumn, children}) => {
  const [open, setOpen] = useState(false);

  // Leaving the browser window mid-hover swallows the mouseleave, leaving the
  // bubble up forever (and a second one appears on the next hover); close it
  // on window blur.
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
        tooltip: {
          className: classNames(
            moduleStyles.pixelTooltip,
            fromLeftColumn && moduleStyles.pixelTooltipLeftColumn
          ),
        },
      }}
    >
      {children}
    </Tooltip>
  );
};

export default PixelTooltip;

import classNames from 'classnames';
import {useEffect, useRef, type FunctionComponent, type ReactNode} from 'react';

import {
  WithTooltip,
  type WithTooltipHandle,
} from '@code-dot-org/component-library/tooltip';

import moduleStyles from './pixel-editor.module.scss';

// WithTooltip preconfigured for the editor's toolbar: small bubble to the
// right, quick hide, lifted above the modal overlay (see .pixelTooltip).
// fromLeftColumn compensates for the trigger sitting one toolbar column
// further from the canvas, so every bubble lands on the same x.
const PixelTooltip: FunctionComponent<{
  tooltipId: string;
  text: string;
  fromLeftColumn?: boolean;
  children: ReactNode;
}> = ({tooltipId, text, fromLeftColumn, children}) => {
  const handleRef = useRef<WithTooltipHandle>(null);

  // Leaving the browser window mid-hover swallows the mouseleave, leaving
  // the bubble up forever (and a second one appears on the next hover);
  // hide on window blur.
  useEffect(() => {
    const hide = () => handleRef.current?.hideTooltip();
    window.addEventListener('blur', hide);
    return () => window.removeEventListener('blur', hide);
  }, []);

  return (
    <WithTooltip
      ref={handleRef}
      tooltipProps={{
        tooltipId,
        text,
        size: 's',
        direction: 'onRight',
        className: classNames(
          moduleStyles.pixelTooltip,
          fromLeftColumn && moduleStyles.pixelTooltipLeftColumn,
        ),
      }}
      hideDelayMs={10}
      hideOnFirstLeave={true}
    >
      {children}
    </WithTooltip>
  );
};

export default PixelTooltip;

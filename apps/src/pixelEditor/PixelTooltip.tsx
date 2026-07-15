import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import classNames from 'classnames';
import React from 'react';

import moduleStyles from './pixel-editor.module.scss';

// WithTooltip preconfigured for the editor's toolbar: small bubble to the
// right, quick hide, lifted above the modal overlay (see .pixelTooltip).
// fromLeftColumn compensates for the trigger sitting one toolbar column
// further from the canvas, so every bubble lands on the same x.
const PixelTooltip: React.FunctionComponent<{
  tooltipId: string;
  text: string;
  fromLeftColumn?: boolean;
  children: React.ReactNode;
}> = ({tooltipId, text, fromLeftColumn, children}) => (
  <WithTooltip
    tooltipProps={{
      tooltipId,
      text,
      size: 's',
      direction: 'onRight',
      className: classNames(
        moduleStyles.pixelTooltip,
        fromLeftColumn && moduleStyles.pixelTooltipLeftColumn
      ),
    }}
    hideDelayMs={10}
    hideOnFirstLeave={true}
  >
    {children}
  </WithTooltip>
);

export default PixelTooltip;

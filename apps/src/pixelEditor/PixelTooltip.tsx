import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import React from 'react';

import moduleStyles from './pixel-editor.module.scss';

// WithTooltip preconfigured for the editor's toolbar: small bubble to the
// right, quick hide, lifted above the modal overlay (see .pixelTooltip).
const PixelTooltip: React.FunctionComponent<{
  tooltipId: string;
  text: string;
  children: React.ReactNode;
}> = ({tooltipId, text, children}) => (
  <WithTooltip
    tooltipProps={{
      tooltipId,
      text,
      size: 's',
      direction: 'onRight',
      className: moduleStyles.pixelTooltip,
    }}
    hideDelayMs={10}
    hideOnFirstLeave={true}
  >
    {children}
  </WithTooltip>
);

export default PixelTooltip;

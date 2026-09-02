import {Theme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {ToastAnnouncer} from '@code-dot-org/component-library/toast';
import {Tooltip, TooltipProps} from '@mui/material';
import React, {ReactElement, useEffect} from 'react';

import i18n from '@cdo/locale';

export const COPIED_TOOLTIP_DURATION_MS = 2000;

export interface CopiedTooltipProps {
  /** When the last copy succeeded; each new value re-arms the confirmation. */
  copiedAt: number | null;
  /** Called {@link COPIED_TOOLTIP_DURATION_MS} after `copiedAt`; set it to null. */
  onHide: () => void;
  /** The trigger. Must forward a ref and accept the tooltip's props. */
  children: ReactElement;
  placement?: TooltipProps['placement'];
  /** Theme for the bubble, which portals out of any `data-theme` subtree. */
  dataTheme?: Theme;
}

/**
 * A "Copied!" bubble over a copy button, opened by the caller rather than by
 * hover or focus and hidden again on a timer.
 *
 * The bubble is `aria-hidden` and the text announced from a live region
 * instead: a changing `aria-describedby` is not reliably spoken.
 */
const CopiedTooltip: React.FunctionComponent<CopiedTooltipProps> = ({
  copiedAt,
  onHide,
  children,
  placement = 'top',
  dataTheme,
}) => {
  useEffect(() => {
    if (copiedAt === null) {
      return;
    }
    const timeout = setTimeout(onHide, COPIED_TOOLTIP_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [copiedAt, onHide]);

  return (
    <>
      <Tooltip
        open={copiedAt !== null}
        placement={placement}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        title={
          <>
            <FontAwesomeV6Icon iconName="check" iconStyle="solid" />
            {i18n.copied()}
          </>
        }
        slotProps={{
          popper: {'aria-hidden': true},
          tooltip: dataTheme ? {'data-theme': dataTheme} : undefined,
        }}
      >
        {children}
      </Tooltip>
      {/* Keyed per copy so a repeated copy is announced again. */}
      <ToastAnnouncer
        key={copiedAt ?? 'idle'}
        message={copiedAt === null ? null : i18n.copied()}
      />
    </>
  );
};

export default CopiedTooltip;

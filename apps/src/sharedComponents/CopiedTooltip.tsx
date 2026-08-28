import {Theme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {ToastAnnouncer} from '@code-dot-org/component-library/toast';
import {Tooltip, TooltipProps} from '@mui/material';
import React, {ReactElement, useEffect} from 'react';

import i18n from '@cdo/locale';

/** How long the confirmation stays up before `onHide` fires. */
export const COPIED_TOOLTIP_DURATION_MS = 2000;

export interface CopiedTooltipProps {
  /** Whether the confirmation is showing. Set it true when a copy succeeds. */
  copied: boolean;
  /** Called once {@link COPIED_TOOLTIP_DURATION_MS} has elapsed; set `copied` false. */
  onHide: () => void;
  /** The trigger. Must forward a ref and accept the tooltip's props. */
  children: ReactElement;
  /** Tooltip placement; defaults to above the trigger. */
  placement?: TooltipProps['placement'];
  /**
   * Design system theme for the bubble. MUI renders the tooltip in a portal on
   * `document.body`, so it does not inherit a `data-theme` subtree; pass the
   * surrounding theme when the trigger sits in one (e.g. a Lab2 surface).
   */
  dataTheme?: Theme;
}

/**
 * A "Copied!" bubble over a copy button, so a click that only touches the
 * clipboard still reports that it worked.
 *
 * The bubble is opened by the caller rather than by hover or focus, and it
 * hides itself on a timer. The popper is `aria-hidden` on purpose: the text is
 * announced once from the always-mounted live region instead, which is
 * reliable in a way a changing `aria-describedby` is not.
 */
const CopiedTooltip: React.FunctionComponent<CopiedTooltipProps> = ({
  copied,
  onHide,
  children,
  placement = 'top',
  dataTheme,
}) => {
  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = setTimeout(onHide, COPIED_TOOLTIP_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [copied, onHide]);

  return (
    <>
      <Tooltip
        open={copied}
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
      {/*
       * `polite` rather than the announcer's assertive default: this region is
       * mounted for as long as the copy button is, and a `role="alert"` that
       * sits empty next to real alerts is both noisy and hard to tell apart
       * from them.
       */}
      <ToastAnnouncer
        message={copied ? i18n.copied() : null}
        politeness="polite"
      />
    </>
  );
};

export default CopiedTooltip;

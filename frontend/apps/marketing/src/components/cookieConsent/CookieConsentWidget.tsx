'use client';
import * as ConsentManagerWidget from '@c15t/react/consent-manager-widget';

import Button from '@code-dot-org/component-library/button';
export const CookieConsentWidget = () => {
  return (
    <ConsentManagerWidget.Root>
      <ConsentManagerWidget.Footer>
        <ConsentManagerWidget.FooterSubGroup
          themeKey={'widget.footer.sub-group'}
        >
          <ConsentManagerWidget.RejectButton
            themeKey={'widget.footer.reject-button'}
            asChild
          >
            <Button text={'Reject All'} type={'secondary'} />
          </ConsentManagerWidget.RejectButton>
          <ConsentManagerWidget.AcceptAllButton
            themeKey={'widget.footer.accept-button'}
            asChild
          >
            <Button text={'Accept All'} type={'primary'} />
          </ConsentManagerWidget.AcceptAllButton>
        </ConsentManagerWidget.FooterSubGroup>
        <ConsentManagerWidget.SaveButton
          themeKey={'widget.footer.save-button'}
          asChild
        >
          <Button text={'Save Preferences'} type={'tertiary'} />
        </ConsentManagerWidget.SaveButton>
      </ConsentManagerWidget.Footer>
    </ConsentManagerWidget.Root>
  );
};

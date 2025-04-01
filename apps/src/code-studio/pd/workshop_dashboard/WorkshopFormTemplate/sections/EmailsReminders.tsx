import {LinkButton} from '@code-dot-org/component-library/button';
import Toggle from '@code-dot-org/component-library/toggle';
import {
  BodyFourText,
  Heading2,
  OverlineThreeText,
} from '@code-dot-org/component-library/typography';
import React, {FC, memo, useCallback} from 'react';

import {EmailsRemindersProps} from '../types';

import commonStyles from '../styles.module.scss';

export const PreviewEmailLink: FC<{href?: string}> = ({href}) => {
  if (!href) return null;
  return (
    <LinkButton
      href={href}
      text="Preview email"
      target="_blank"
      color="black"
      type="tertiary"
      size="s"
      iconRight={{
        iconName: 'up-right-from-square',
      }}
    />
  );
};

export const EmailsReminders: FC<EmailsRemindersProps> = ({
  config: {fields},
  suppressEmail,
  dispatchWorkshop,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const {checked} = e.target;
      dispatchWorkshop({
        type: 'UPDATE_WORKSHOP',
        payload: {
          suppressEmail: !checked,
        },
      });
    },
    [dispatchWorkshop]
  );
  return (
    <>
      <Heading2 visualAppearance="heading-sm">Emails & Reminders</Heading2>
      <div className={commonStyles.row}>
        <div className={commonStyles.col}>
          <OverlineThreeText>pre-workshop emails</OverlineThreeText>
          {fields.suppress_email && (
            <div className={commonStyles.toggleWrapper}>
              <div className={commonStyles.row}>
                <Toggle
                  label="3 and 10-days prior to start date"
                  name="reminder emails"
                  size="s"
                  checked={!suppressEmail}
                  onChange={handleChange}
                />
                <PreviewEmailLink href="" />
              </div>
            </div>
          )}
          <div className={commonStyles.toggleWrapper}>
            <div className={commonStyles.row}>
              <Toggle
                label="Pre-workshop survey*"
                name="pre-workshop survey email"
                size="s"
                checked={true}
                onChange={() => {}}
                disabled={true}
              />
              <PreviewEmailLink href="" />
            </div>
            <BodyFourText>
              *We require this email for every workshop.
            </BodyFourText>
          </div>
        </div>
        <div className={commonStyles.col}>
          <OverlineThreeText>post-workshop emails</OverlineThreeText>
          <div className={commonStyles.toggleWrapper}>
            <div className={commonStyles.row}>
              <Toggle
                label="Post-workshop survey*"
                name="post-workshop survey email"
                size="s"
                checked={true}
                onChange={() => {}}
                disabled={true}
              />
              <PreviewEmailLink href="" />
            </div>
            <BodyFourText>
              *We require this email for every workshop.
            </BodyFourText>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(EmailsReminders);

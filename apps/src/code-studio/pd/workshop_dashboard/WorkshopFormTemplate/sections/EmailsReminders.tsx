import {LinkButton} from '@code-dot-org/component-library/button';
import Toggle from '@code-dot-org/component-library/toggle';
import {
  BodyFourText,
  Heading2,
  OverlineThreeText,
} from '@code-dot-org/component-library/typography';
import React, {FC, memo, useCallback} from 'react';

import {SectionProps, WorkshopFormState} from '../../workshops/types';

import commonStyles from '../styles.module.scss';

type EmailsRemindersKeys = 'suppressEmail';

export interface EmailsRemindersProps
  extends SectionProps,
    Pick<WorkshopFormState, EmailsRemindersKeys> {}

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

  if (!fields.suppress_email) {
    return null;
  }

  return (
    <section>
      <Heading2 visualAppearance="heading-sm">Emails & Reminders</Heading2>
      <div className={commonStyles.row}>
        <div className={commonStyles.col}>
          <OverlineThreeText>pre-workshop emails</OverlineThreeText>
          {fields.suppress_email && (
            <div className={commonStyles.toggleWrapper}>
              <div className={commonStyles.row}>
                <Toggle
                  label={fields.suppress_email.label}
                  name={fields.suppress_email.stateKey}
                  size="s"
                  checked={!suppressEmail}
                  onChange={handleChange}
                />
                {/* TODO: blank href for now until we have mailjet email preview links */}
                <PreviewEmailLink href="" />
              </div>
            </div>
          )}
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
              {/* TODO: blank href for now until we have mailjet email preview links */}
              <PreviewEmailLink href="" />
            </div>
            <BodyFourText>
              *We require this email for every workshop.
            </BodyFourText>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(EmailsReminders);

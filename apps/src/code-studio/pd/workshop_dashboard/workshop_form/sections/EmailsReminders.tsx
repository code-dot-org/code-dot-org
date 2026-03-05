import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Toggle from '@code-dot-org/component-library/toggle';
import {Typography, Button as MuiButton} from '@mui/material';
import React, {FC, memo, useCallback} from 'react';

import {SectionProps, WorkshopFormState} from '../../workshops/types';

import commonStyles from '../WorkshopForm.module.scss';

type EmailsRemindersKeys = 'suppressEmail';

export interface EmailsRemindersProps
  extends SectionProps,
    Pick<WorkshopFormState, EmailsRemindersKeys> {}

export const PreviewEmailLink: FC<{href?: string}> = ({href}) => {
  if (!href) return null;
  return (
    <MuiButton
      variant="text"
      color="secondary"
      size="small"
      href={href}
      target="_blank"
      endIcon={<FontAwesomeV6Icon iconName="up-right-from-square" />}
    >
      {'Preview email'}
    </MuiButton>
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
      <Typography component="h2" variant="h5" gutterBottom>
        Emails & Reminders
      </Typography>
      <div className={commonStyles.row}>
        <div className={commonStyles.col}>
          <Typography variant="overline3" gutterBottom>
            pre-workshop emails
          </Typography>
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
          <Typography variant="overline3" gutterBottom>
            post-workshop emails
          </Typography>
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
            <Typography variant="body4" gutterBottom>
              *We require this email for every workshop.
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(EmailsReminders);

import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import {Button, buttonColors} from '@code-dot-org/component-library/button';
import {Dialog} from '@code-dot-org/component-library/dialog';
import Link from '@code-dot-org/component-library/link';
import Tags from '@code-dot-org/component-library/tags';
import {
  Heading2,
  BodyFourText,
  StrongText,
  Heading3,
} from '@code-dot-org/component-library/typography';
import {Card, CardContent, CardHeader, Box} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useState} from 'react';

import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {WorkshopData} from '../../types';

import styles from '../../workshop.module.scss';

interface WorkshopStatusSectionProps {
  workshop: WorkshopData;
  isWorkshopAdmin: boolean;
  onWorkshopUpdate: () => void;
}

const dialogs = [
  {
    stateKey: 'start',
    label: 'Start',
    description: 'Are you sure you want to start this workshop?',
    primaryButtonProps: {},
  },
  {
    stateKey: 'end',
    label: 'End',
    description:
      'Ending this workshop will close the attendance. Are you sure you want to end this workshop now?',
    primaryButtonProps: {
      color: buttonColors.destructive,
    },
  },
  {
    stateKey: 'reopen',
    label: 'Reopen',
    description:
      'Are you sure you want to reopen this workshop and change it back to "In Progress"? Note reopening then ending again will send exit survey emails for new attendees, but will not re-send surveys that were already sent.',
    primaryButtonProps: {},
  },
  {
    stateKey: 'unstart',
    label: 'Unstart',
    description:
      'Are you sure you want to unstart this workshop and change it back to "Not Started?"',
    primaryButtonProps: {},
  },
];

export type WorkshopActions = 'start' | 'end' | 'unstart' | 'reopen';

export const WorkshopStatusSection: React.FC<WorkshopStatusSectionProps> = ({
  workshop,
  isWorkshopAdmin,
  onWorkshopUpdate,
}) => {
  const [activeDialog, setActiveDialog] = useState<WorkshopActions | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notStarted = workshop.state === 'Not Started';
  const inProgress = workshop.state === 'In Progress';
  const ended = workshop.state === 'Ended';
  const cannotEndWorkshop = !workshop.readyToClose;

  const handleClick = (stateKey: WorkshopActions) => {
    setError(null);
    setActiveDialog(stateKey);
  };

  const generateHandler = useCallback(
    (action: WorkshopActions) => async () => {
      setIsUpdating(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/v1/pd/workshops/${workshop.id}/${action}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': await getAuthenticityToken(),
            },
          }
        );

        if (response.ok) {
          onWorkshopUpdate();
        } else {
          let errorMessage = `Failed to ${action} workshop. Please try again.`;
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (
            errorData.errors &&
            Array.isArray(errorData.errors) &&
            errorData.errors.length > 0
          ) {
            errorMessage = errorData.errors.join(', ');
          }

          if (response.status === 403) {
            errorMessage = 'You do not have permission to perform this action.';
          } else if (response.status === 404) {
            errorMessage = 'Workshop not found.';
          } else if (response.status >= 500) {
            errorMessage = 'Server error occurred. Please try again later.';
          }

          setError(errorMessage);
        }
      } catch (unknownError) {
        setError('An unknown error occurred. Please try again.');
      } finally {
        setIsUpdating(false);
        setActiveDialog(null);
      }
    },
    [onWorkshopUpdate, workshop.id]
  );

  return (
    <>
      <Card className={styles.card}>
        <CardHeader
          className={styles.cardHeader}
          title={
            <Box className={styles.cardHeaderContainer}>
              <Box className={styles.cardHeaderRow}>
                <Heading2 visualAppearance="body-two" noMargin>
                  <StrongText>Workshop Status</StrongText>
                </Heading2>
                <Tags
                  className={classNames(styles.workshopTag, styles.status)}
                  tagsList={[
                    {
                      label: workshop.state,
                      key: 'workshop-status',
                    },
                  ]}
                  size="s"
                />
              </Box>
              {isWorkshopAdmin && inProgress && (
                <Button
                  text="Unstart (admin)"
                  size="xs"
                  type="secondary"
                  color={buttonColors.gray}
                  onClick={() => handleClick('unstart')}
                />
              )}
              {isWorkshopAdmin && ended && (
                <Button
                  text="Reopen (admin)"
                  size="xs"
                  type="secondary"
                  color={buttonColors.gray}
                  onClick={() => handleClick('reopen')}
                />
              )}
            </Box>
          }
        />
        <CardContent className={styles.cardContent}>
          <Box className={styles.sectionContainer}>
            <Box className={styles.column}>
              {notStarted && (
                <BodyFourText noMargin>
                  On the day of your workshop, click the "Start Workshop" button
                  below.
                </BodyFourText>
              )}

              {inProgress && workshop.accountRequiredForAttendance && (
                <>
                  <BodyFourText noMargin>
                    On the day of the workshop, ask workshop attendees to follow
                    the steps:
                  </BodyFourText>
                  <Heading3 visualAppearance="body-two" noMargin>
                    <StrongText>Step 1: Sign into Code Studio</StrongText>
                  </Heading3>
                  <BodyFourText noMargin>
                    Tell workshop attendees to sign into their Code Studio
                    accounts. If they do not already have an account tell them
                    to create one by going to{' '}
                    <Link
                      className={styles.workshopLink}
                      size="xs"
                      openInNewTab
                      aria-label="Open studio page in new tab"
                      href={'/'}
                    >
                      {window.origin}
                    </Link>
                  </BodyFourText>
                  <Heading3 visualAppearance="body-two" noMargin>
                    <StrongText>Step 2: Take attendance</StrongText>
                  </Heading3>
                  <BodyFourText noMargin>
                    After workshop attendees have signed into their Code Studio
                    accounts, use the attendance links below to take attendance.
                    Note: Workshop attendees need to have enrolled in the
                    workshop in order to take attendance. They can enroll in the
                    workshop using{' '}
                    <Link
                      className={styles.workshopLink}
                      size="xs"
                      openInNewTab
                      aria-label="Open enrollment page in new tab"
                      href={`/professional-learning/workshops/${workshop.id}`}
                    >
                      {`${window.origin}/professional-learning/workshops/${workshop.id}`}
                    </Link>
                  </BodyFourText>
                </>
              )}

              {inProgress && !workshop.accountRequiredForAttendance && (
                <>
                  <BodyFourText noMargin>
                    On the day of the workshop, ask workshop attendees to
                    register if they haven't already:
                  </BodyFourText>
                  <BodyFourText noMargin>
                    <Link
                      className={styles.workshopLink}
                      size="xs"
                      openInNewTab
                      aria-label="Open enrollment page in new tab"
                      href={`/professional-learning/workshops/${workshop.id}`}
                    >
                      {`${window.origin}/professional-learning/workshops/${workshop.id}`}
                    </Link>
                  </BodyFourText>
                </>
              )}

              {inProgress && cannotEndWorkshop && (
                <BodyFourText noMargin>
                  Workshop should not end until all sessions are complete and
                  attendance has been taken.
                </BodyFourText>
              )}

              {ended && (
                <>
                  <BodyFourText noMargin>
                    We hope you had a great workshop!
                  </BodyFourText>
                  <BodyFourText noMargin>
                    Workshop attendees will receive an email with survey link
                    from{' '}
                    <Link size="xs" href="mailto:survey@code.org">
                      survey@code.org
                    </Link>
                    . If they do not receive the link ask them to check their
                    spam. Many school districts block outside emails. You can
                    also recommend they set hadi_partovi and any other @code.org
                    addresses to their contacts or safe senders list, so they
                    don't miss out on future emails. Lastly, they can check to
                    make sure the email went to the correct email address by
                    logging into their Code Studio account, navigating to the
                    'my account' page via the top right corner to confirm their
                    email address was typed correctly when they first created
                    the account.
                  </BodyFourText>
                  <BodyFourText noMargin>
                    If they still can't find the email, have them email{' '}
                    <Link size="xs" href="mailto:support@code.org">
                      support@code.org
                    </Link>{' '}
                    and we will help them.
                  </BodyFourText>
                </>
              )}

              {error && (
                <Alert
                  text={error}
                  type={alertTypes.danger}
                  onClose={() => setError(null)}
                  closeLabel="Dismiss error"
                  size="s"
                />
              )}

              <Box>
                {notStarted && (
                  <Button
                    size="s"
                    text="Start Workshop"
                    onClick={() => handleClick('start')}
                    disabled={isUpdating}
                  />
                )}

                {inProgress && (
                  <Button
                    size="s"
                    text="End workshop"
                    type="secondary"
                    color={buttonColors.destructive}
                    onClick={() => handleClick('end')}
                    disabled={isUpdating}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {dialogs.map(({stateKey, label, description, primaryButtonProps}) =>
        activeDialog === stateKey ? (
          <Dialog
            key={stateKey}
            onClose={() => setActiveDialog(null)}
            title={`${label} Workshop?`}
            description={description}
            primaryButtonProps={{
              text: `${label} Workshop`,
              size: 's',
              disabled: isUpdating,
              onClick: generateHandler(stateKey),
              ...primaryButtonProps,
            }}
            secondaryButtonProps={{
              size: 's',
              text: 'Cancel',
              type: 'secondary',
              color: buttonColors.gray,
              onClick: () => setActiveDialog(null),
              disabled: isUpdating,
            }}
          />
        ) : null
      )}
    </>
  );
};

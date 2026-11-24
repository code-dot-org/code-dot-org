import {
  Button as MuiButton,
  Link as MuiLink,
  Typography as MuiTypography,
} from '@mui/material';
import React from 'react';

import {VERIFIED_TEACHER_SUPPORT_LINK} from '@cdo/apps/aichat/constants';
import penguinImage from '@cdo/static/adaptive/penguin-shouting.svg';

import styles from './accessBlockedScreen.module.scss';

const QUEST_BUILDER_URL =
  '/courses/quest-builder-2026/units/1/lessons/1/levels/1';
const HOMEPAGE_URL = '/home';

const NOT_AVAILABLE_HEADING = 'AI Makerspace isn’t available';

export type BlockedReason =
  | 'unverifiedTeacher'
  | 'studentNoAccess'
  | 'studentNoSection';

const QuestBuilderButton: React.FunctionComponent<{
  variant: 'outlined' | 'contained';
}> = ({variant}) => (
  <MuiButton
    variant={variant}
    color={variant === 'outlined' ? 'secondary' : 'primary'}
    size="large"
    href={QUEST_BUILDER_URL}
  >
    Try Quest Builder
  </MuiButton>
);

const HomepageButton: React.FunctionComponent = () => (
  <MuiButton
    variant="outlined"
    color="secondary"
    size="large"
    href={HOMEPAGE_URL}
  >
    Return to homepage
  </MuiButton>
);

const Message: React.FunctionComponent<{heading: string; body: string}> = ({
  heading,
  body,
}) => (
  <div className={styles.text}>
    <MuiTypography variant="h2" component="h1">
      {heading}
    </MuiTypography>
    <MuiTypography variant="body1">{body}</MuiTypography>
  </div>
);

const AccessBlockedScreen: React.FunctionComponent<{
  reason: BlockedReason;
  onContinue: () => void;
}> = ({reason, onContinue}) => (
  <div className={styles.screen}>
    <img src={penguinImage} alt="" className={styles.penguin} />
    {reason === 'unverifiedTeacher' && (
      <>
        <Message
          heading="Verify your account to use AI Makerspace"
          body="AI Makerspace requires AI chat tools to complete. To keep students safe, these tools are available only to classes with verified teachers. Verify your account to unlock AI chat tools or try our Quest Builder activity instead."
        />
        <div className={styles.actions}>
          <div className={styles.buttons}>
            <QuestBuilderButton variant="outlined" />
            <MuiButton
              variant="contained"
              color="primary"
              size="large"
              href={VERIFIED_TEACHER_SUPPORT_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get verified
            </MuiButton>
          </div>
          <MuiLink
            component="button"
            variant="body3"
            underline="always"
            className={styles.continue}
            onClick={onContinue}
          >
            Continue to AI Makerspace*
          </MuiLink>
        </div>
        <div className={styles.footnote}>
          <MuiTypography variant="body4">
            *Some activities in AI Makerspace will be unavailable
          </MuiTypography>
        </div>
      </>
    )}
    {reason === 'studentNoAccess' && (
      <>
        <Message
          heading={NOT_AVAILABLE_HEADING}
          body="Your class doesn’t have access to this course yet. Let your teacher know you’re interested or try our Quest Builder activity instead."
        />
        <div className={styles.buttons}>
          <HomepageButton />
          <QuestBuilderButton variant="contained" />
        </div>
      </>
    )}
    {reason === 'studentNoSection' && (
      <>
        <Message
          heading={NOT_AVAILABLE_HEADING}
          body="To use this course, you need to be in a class section with a teacher who has set up access to AI chat tools. Ask your teacher about joining a class that uses this course or try our Quest Builder activity instead."
        />
        <div className={styles.buttons}>
          <HomepageButton />
          <QuestBuilderButton variant="contained" />
        </div>
      </>
    )}
  </div>
);

export default AccessBlockedScreen;

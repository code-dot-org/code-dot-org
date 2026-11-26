import {
  Button as MuiButton,
  Link as MuiLink,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import sadBeeImage from '@cdo/static/adaptive/bee-sad.svg';
import penguinImage from '@cdo/static/adaptive/penguin-shouting.svg';

import styles from './accessBlockedScreen.module.scss';

const MAKERSPACE_SETUP_SUPPORT_LINK =
  'https://support.code.org/hc/en-us/articles/50616846268045-Getting-ready-for-AI-Makerspace-Hour-of-AI-grades-9-12';
const QUEST_BUILDER_URL =
  '/courses/quest-builder-2026/units/1/lessons/1/levels/1';
const HOMEPAGE_URL = '/home';

const NOT_AVAILABLE_HEADING = 'AI Makerspace isn’t available';

export type BlockedReason =
  | 'unverifiedTeacher'
  | 'studentNoAccess'
  | 'studentNoSection'
  | 'aiUnavailable';

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
  onContinue?: () => void;
}> = ({reason, onContinue}) => (
  <div
    className={classNames(
      styles.screen,
      reason === 'aiUnavailable' && styles.outage
    )}
  >
    <img
      src={reason === 'aiUnavailable' ? sadBeeImage : penguinImage}
      alt=""
      className={styles.illustration}
    />
    {reason === 'aiUnavailable' && (
      <>
        <Message
          heading="AI Makerspace is temporarily unavailable"
          body="AI Makerspace uses an AI service that’s having technical issues right now. Try our Quest Builder activity instead or check back later."
        />
        <div className={styles.buttons}>
          <MuiButton
            variant="outlined"
            color="secondary"
            size="large"
            href={HOMEPAGE_URL}
          >
            Back to Home page
          </MuiButton>
          <QuestBuilderButton variant="contained" />
        </div>
      </>
    )}
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
              href={MAKERSPACE_SETUP_SUPPORT_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn about setup
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

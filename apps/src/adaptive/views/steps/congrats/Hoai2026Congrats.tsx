// The Hour of AI 2026 wrap-up: a card for the Builder's Challenge, then a
// row of what to do next. Students get a share link and the certificate;
// teachers also get two links out to professional learning. Every row item
// leaves the tutorial, so the panel has no Continue of its own.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import DCDO from '@cdo/apps/dcdo';
import CopiedTooltip from '@cdo/apps/sharedComponents/CopiedTooltip';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {usePathwayProject} from '../../../project/usePathwayProject';
import {usePathwayContext} from '../../PathwayContext';
import {CongratsPanelProps} from '../CongratsStep';

import styles from './congrats.module.scss';

const HEADING = 'You just built something with AI!';
const DESCRIPTION_WITH_CHALLENGE =
  'Want to keep going? Join the Building with AI Challenge, a national competition for high school teams. Build your project over eight weeks and submit by Feb 1, 2027.';
const DESCRIPTION_WITHOUT_CHALLENGE =
  'You created a website with your own vision and design using AI. Keep exploring and building with AI to create even more amazing projects!';
const IMAGE_URL =
  'https://images.code.org/dc6583670c742dbc656e3e805cafee15-ai-makerspace-congrats-image.png';

const ELEVATE_URL = 'https://code.org/hour-of-ai';
const AI_FOUNDATIONS_URL =
  'https://code.org/en-US/curriculum/artificial-intelligence-foundations';

const EXTERNAL_ICON = (
  <FontAwesomeV6Icon iconName="arrow-up-right-from-square" />
);

interface CardProps {
  icon: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

const Card: React.FunctionComponent<CardProps> = ({
  icon,
  title,
  description,
  children,
}) => (
  <li className={styles.card}>
    <div className={styles.cardHeading}>
      <FontAwesomeV6Icon iconName={icon} className={styles.cardIcon} />
      <MuiTypography variant="label3" component="h2">
        {title}
      </MuiTypography>
    </div>
    <MuiTypography variant="body4" className={styles.cardDescription}>
      {description}
    </MuiTypography>
    {children}
  </li>
);

const ExternalLinkButton: React.FunctionComponent<{
  href: string;
  size?: 'extraSmall' | 'medium';
  children: React.ReactNode;
}> = ({href, size = 'extraSmall', children}) => (
  <MuiButton
    variant="outlined"
    color="secondary"
    size={size}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    endIcon={EXTERNAL_ICON}
  >
    {children}
  </MuiButton>
);

const CopyLinkButton: React.FunctionComponent<{shareUrl: string}> = ({
  shareUrl,
}) => {
  const [copiedAt, setCopiedAt] = useState<number | null>(null);
  const copy = useCallback(() => {
    copyToClipboard(
      shareUrl,
      () => setCopiedAt(Date.now()),
      () => console.error('Error copying share link to clipboard')
    );
  }, [shareUrl]);
  return (
    <CopiedTooltip copiedAt={copiedAt} onHide={() => setCopiedAt(null)}>
      <MuiButton
        variant="outlined"
        color="secondary"
        size="extraSmall"
        onClick={copy}
        startIcon={<FontAwesomeV6Icon iconName={copiedAt ? 'check' : 'link'} />}
      >
        Copy link
      </MuiButton>
    </CopiedTooltip>
  );
};

const Hoai2026Congrats: React.FunctionComponent<CongratsPanelProps> = ({
  step,
  onComplete,
}) => {
  const isTeacher = useAppSelector(
    state => state.currentUser.userType === 'teacher'
  );
  // No level is mounted on this step, so the project's own manager can load
  // its channel without racing a step's manager on the same channel.
  const {pathway} = usePathwayContext();
  const {projectManager} = usePathwayProject(pathway);
  const shareUrl = projectManager?.getShareUrl();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const challengeUrl = DCDO.get('builders_challenge_url', undefined);
  const showChallenge =
    typeof challengeUrl === 'string' && challengeUrl.length > 0;

  return (
    <div className={styles.panel}>
      <div className={styles.hero}>
        {step.logoUrl && (
          <img src={step.logoUrl} alt="" className={styles.logo} />
        )}
        <div className={styles.heroText}>
          <MuiTypography
            variant="h3"
            component="h1"
            tabIndex={-1}
            ref={headingRef}
          >
            {HEADING}
          </MuiTypography>
          <MuiTypography variant="body2">
            {showChallenge
              ? DESCRIPTION_WITH_CHALLENGE
              : DESCRIPTION_WITHOUT_CHALLENGE}
          </MuiTypography>
        </div>
        <img src={IMAGE_URL} alt="" className={styles.heroImage} />
        {showChallenge && (
          <ExternalLinkButton href={challengeUrl} size="medium">
            Learn about the Building with AI Challenge
          </ExternalLinkButton>
        )}
      </div>
      <ul className={styles.cards}>
        {shareUrl && (
          <Card
            icon="share"
            title="Share your site"
            description="Send it to friends to explore."
          >
            <CopyLinkButton shareUrl={shareUrl} />
          </Card>
        )}
        <Card
          icon="award"
          title="Get your certificate"
          description="Print it with your name on it."
        >
          <MuiButton
            variant="outlined"
            color="secondary"
            size="extraSmall"
            onClick={onComplete}
          >
            Certificate
          </MuiButton>
        </Card>
        {isTeacher && (
          <>
            <Card
              icon="lightbulb"
              title="Elevate your Hour of AI"
              description="Prepare to lead an Hour of AI."
            >
              <ExternalLinkButton href={ELEVATE_URL}>
                Learn more
              </ExternalLinkButton>
            </Card>
            <Card
              icon="lightbulb"
              title="AI Foundations"
              description="Bring AI to your classroom."
            >
              <ExternalLinkButton href={AI_FOUNDATIONS_URL}>
                Learn more
              </ExternalLinkButton>
            </Card>
          </>
        )}
      </ul>
    </div>
  );
};

export default Hoai2026Congrats;

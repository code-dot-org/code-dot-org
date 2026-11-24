// The Hour of AI 2026 wrap-up: a card for the challenge, then a
// row of what to do next. Students get a share link, a zip of their code
// and the certificate; teachers get the share link, the certificate and two
// links out to professional learning. Every row item leaves the tutorial,
// so the panel has no Continue of its own.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import fileDownload from 'js-file-download';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import DCDO from '@cdo/apps/dcdo';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import CopiedTooltip from '@cdo/apps/sharedComponents/CopiedTooltip';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import heroImage from '@cdo/static/hoai2026/adaptive/ai-makerspace-celebration.png';

import {sendAdaptiveEvent} from '../../../metricsHelpers';
import {buildProjectZip, exportName} from '../../../project/exportProjectZip';
import {isMultiFile} from '../../../project/summarizeProjectFiles';
import {usePathwayProject} from '../../../project/usePathwayProject';
import {usePathwayContext} from '../../PathwayContext';
import {CongratsPanelProps} from '../CongratsStep';

import styles from './congrats.module.scss';

const HEADING = 'You just built something with AI!';
const DEFAULT_CHALLENGE_DESCRIPTION =
  'Want to keep going? Join the Building with AI Challenge, a national competition for high school teams. Build your project over eight weeks and submit by Feb 1, 2027.';
const DESCRIPTION_WITHOUT_CHALLENGE =
  'You created a website with your own vision and design using AI. Keep exploring and building with AI to create even more amazing projects!';
const DEFAULT_CHALLENGE_BUTTON_TEXT =
  'Learn about the Building with AI Challenge';

const ELEVATE_URL = 'https://code.org/hour-of-ai';
const AI_FOUNDATIONS_URL =
  'https://code.org/en-US/curriculum/artificial-intelligence-foundations';

type CongratsLink =
  | 'challenge'
  | 'copyShareLink'
  | 'exportCode'
  | 'certificate'
  | 'elevateHourOfAi'
  | 'aiFoundations';

// dcdo.rb forwards unset keys as null, so the default passed to DCDO.get
// alone would not apply.
const dcdoString = (key: string, fallback: string): string => {
  const value = DCDO.get(key, fallback);
  return typeof value === 'string' && value.length > 0 ? value : fallback;
};

const sendLinkClicked = (link: CongratsLink) =>
  sendAdaptiveEvent(EVENTS.ADAPTIVE_CONGRATS_LINK_CLICKED, {link});

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
  link: CongratsLink;
  size?: 'extraSmall' | 'medium';
  children: React.ReactNode;
}> = ({href, link, size = 'extraSmall', children}) => (
  <MuiButton
    variant="outlined"
    color="secondary"
    size={size}
    href={href}
    onClick={() => sendLinkClicked(link)}
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
    sendLinkClicked('copyShareLink');
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

const ExportCodeButton: React.FunctionComponent<{
  source: MultiFileSource;
  projectName?: string;
}> = ({source, projectName}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [failed, setFailed] = useState(false);
  const exportCode = useCallback(async () => {
    sendLinkClicked('exportCode');
    setIsExporting(true);
    setFailed(false);
    try {
      const name = exportName(projectName);
      fileDownload(await buildProjectZip(source, name), `${name}.zip`);
    } catch (error) {
      console.error('Error exporting project code', error);
      setFailed(true);
    } finally {
      setIsExporting(false);
    }
  }, [source, projectName]);
  return (
    <>
      <MuiButton
        variant="outlined"
        color="secondary"
        size="extraSmall"
        onClick={exportCode}
        loading={isExporting}
      >
        Export my code
      </MuiButton>
      {failed && (
        <MuiTypography
          variant="body4"
          role="alert"
          className={styles.cardDescription}
        >
          Your code could not be exported. Try again.
        </MuiTypography>
      )}
    </>
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
  const {projectManager, sources, channel} = usePathwayProject(pathway);
  const shareUrl = projectManager?.getShareUrl();
  const source = sources?.source;
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const challengeUrl = DCDO.get('adaptive-challenge-url', undefined);
  const showChallenge =
    typeof challengeUrl === 'string' && challengeUrl.length > 0;
  const challengeDescription = dcdoString(
    'adaptive-challenge-description',
    DEFAULT_CHALLENGE_DESCRIPTION
  );
  const challengeButtonText = dcdoString(
    'adaptive-challenge-button-text',
    DEFAULT_CHALLENGE_BUTTON_TEXT
  );

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
              ? challengeDescription
              : DESCRIPTION_WITHOUT_CHALLENGE}
          </MuiTypography>
        </div>
        <img src={heroImage} alt="" className={styles.heroImage} />
        {showChallenge && (
          <ExternalLinkButton
            href={challengeUrl}
            link="challenge"
            size="medium"
          >
            {challengeButtonText}
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
        {!isTeacher && isMultiFile(source) && (
          <Card
            icon="download"
            title="Export your code"
            description="Continue working outside of CodeAI"
          >
            <ExportCodeButton source={source} projectName={channel?.name} />
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
            onClick={() => {
              sendLinkClicked('certificate');
              onComplete();
            }}
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
              <ExternalLinkButton href={ELEVATE_URL} link="elevateHourOfAi">
                Learn more
              </ExternalLinkButton>
            </Card>
            <Card
              icon="lightbulb"
              title="AI Foundations"
              description="Bring AI to your classroom."
            >
              <ExternalLinkButton
                href={AI_FOUNDATIONS_URL}
                link="aiFoundations"
              >
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

import {MuiCustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import React, {useId} from 'react';

import {ProjectType} from '@cdo/apps/lab2/types';

import {CopyToClipboardButton} from '../CopyToClipboardButton';

import styles from './hoai2026-congrats.module.scss';

// Where the fixed offers lead; the certificate's comes with the level.
const DESTINATIONS = {
  elementary: 'https://studio.code.org/courses/k5-ai-data-2024/units/1/reset',
  middleSchool:
    'https://code.org/en-US/curriculum/artificial-intelligence-discoveries',
  professionalLearning: 'https://code.org/en-US/professional-learning',
};

const TITLE_ID = 'hoai2026-congrats-title';

/** Button props that make an external link of a destination, in a new tab. */
function linkProps(href: string): Partial<MuiButtonProps> {
  return {href, target: '_blank', rel: 'noopener noreferrer'};
}

const ExternalIcon = () => (
  <FontAwesomeV6Icon iconName="arrow-up-right-from-square" iconStyle="solid" />
);

const Resource: React.FunctionComponent<{
  grade: string;
  name: string;
  href: string;
}> = ({grade, name, href}) => (
  <MuiButton
    variant="text"
    className={styles.resource}
    endIcon={<ExternalIcon />}
    {...linkProps(href)}
  >
    <span className={styles.resourceText}>
      <span className={styles.resourceGrade}>{grade}</span>
      <span className={styles.resourceName}>{name}</span>
    </span>
  </MuiButton>
);

const Offer: React.FunctionComponent<{
  icon: string;
  title: string;
  text: string;
  children: React.ReactNode;
}> = ({icon, title, text, children}) => {
  const titleId = useId();
  return (
    <section className={styles.offer} aria-labelledby={titleId}>
      <Typography
        id={titleId}
        component="h3"
        variant="h5"
        className={styles.offerTitle}
      >
        <FontAwesomeV6Icon
          iconName={icon}
          iconStyle="solid"
          className={styles.offerIcon}
        />
        {title}
      </Typography>
      <Typography variant="body2" className={styles.offerText}>
        {text}
      </Typography>
      {children}
    </section>
  );
};

export interface Hoai2026CongratsProps {
  onClose: () => void;
  /** The project's share link; absent while the project cannot be shared. */
  shareUrl?: string;
  projectType?: ProjectType;
  /** Saves and opens a remix of the project; absent while the project may
      not be remixed. */
  onRemix?: () => void;
  /** The unit's finish URL, where a certificate is offered; absent when the
      unit has none. */
  certificateUrl?: string;
}

/**
 * The finish dialog for the 2026 Hour of AI Sprite Lab activity: what the
 * student can do next, and what their teacher can. Its words are English
 * in code, as the 2025 dialog's are.
 */
const Hoai2026Congrats: React.FunctionComponent<Hoai2026CongratsProps> = ({
  onClose,
  shareUrl,
  projectType,
  onRemix,
  certificateUrl,
}) => (
  <MuiCustomDialog
    className={styles.dialog}
    onClose={onClose}
    closeLabel="Close"
    aria-labelledby={TITLE_ID}
  >
    <Typography
      id={TITLE_ID}
      component="h2"
      variant="h4"
      className={styles.title}
    >
      Congratulations!
    </Typography>
    <hr className={styles.rule} />
    <div className={styles.body}>
      <Typography
        id="dsco-dialog-description"
        variant="body2"
        className={styles.intro}
      >
        You made sprites with AI, built a world, and coded your own game.
      </Typography>
      <div className={styles.cards}>
        <section
          className={classNames(styles.card, styles.students)}
          aria-labelledby="hoai2026-congrats-students"
        >
          <Typography variant="overline2" className={styles.eyebrow}>
            For students
          </Typography>
          <Typography
            id="hoai2026-congrats-students"
            component="h3"
            variant="h3"
            className={styles.cardTitle}
          >
            Discover even more blocks in Sprite Lab
          </Typography>
          <div>
            {/* A remix of this game, as the header's Remix button makes;
                held while the project may not be remixed. */}
            <MuiButton
              variant="contained"
              color="white"
              size="large"
              className={styles.open}
              endIcon={
                <FontAwesomeV6Icon iconName="arrow-right" iconStyle="solid" />
              }
              disabled={!onRemix}
              onClick={onRemix}
            >
              Open Sprite Lab
            </MuiButton>
          </div>
          {/* A plain box until the card's picture arrives. */}
          <div className={styles.picture} aria-hidden="true" />
        </section>
        <section
          className={classNames(styles.card, styles.teachers)}
          aria-labelledby="hoai2026-congrats-teachers"
        >
          <Typography variant="overline2" className={styles.eyebrow}>
            For teachers
          </Typography>
          <Typography
            id="hoai2026-congrats-teachers"
            component="h3"
            variant="h3"
            className={styles.cardTitle}
          >
            Bring AI to your classroom
          </Typography>
          <div className={styles.resources}>
            <Resource
              grade="Elementary"
              name="How AI Makes Decisions"
              href={DESTINATIONS.elementary}
            />
            <Resource
              grade="Middle school"
              name="AI Discoveries"
              href={DESTINATIONS.middleSchool}
            />
          </div>
        </section>
      </div>
      <div className={styles.offers}>
        <Offer
          icon="share"
          title="Share your game"
          text="Send it to friends to play."
        >
          {shareUrl && projectType ? (
            <CopyToClipboardButton
              shareUrl={shareUrl}
              projectType={projectType}
              label="Copy link"
              iconName="link"
              copiedIconName="check"
              className={styles.copyLink}
            />
          ) : (
            <Typography variant="body2" className={styles.offerText}>
              This game can't be shared right now.
            </Typography>
          )}
        </Offer>
        <Offer
          icon="award"
          title="Get your certificate"
          text="Print it with your name on it."
        >
          {/* The unit's own finish page, so it opens in place of the lab
              as the lab's Finish would; held while the unit has none. */}
          <MuiButton
            variant="outlined"
            color="secondary"
            href={certificateUrl}
            disabled={!certificateUrl}
          >
            Certificate
          </MuiButton>
        </Offer>
        <Offer
          icon="lightbulb"
          title="Professional learning"
          text="Learn to teach computer science and AI."
        >
          <MuiButton
            variant="outlined"
            color="secondary"
            endIcon={<ExternalIcon />}
            {...linkProps(DESTINATIONS.professionalLearning)}
          >
            Learn more
          </MuiButton>
        </Offer>
      </div>
    </div>
    <hr className={styles.rule} />
    <div className={styles.footer}>
      <MuiButton
        variant="outlined"
        color="secondary"
        size="large"
        onClick={onClose}
        type="button"
      >
        Keep playing
      </MuiButton>
    </div>
  </MuiCustomDialog>
);

export default Hoai2026Congrats;

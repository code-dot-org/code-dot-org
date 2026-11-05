import {MuiCustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {commonI18n as i18n} from '@cdo/apps/types/locale';

import {CopyToClipboardButton} from '../CopyToClipboardButton';

import {FinishDialogProps} from './showFinishDialog';

import styles from './hoai2026-congrats.module.scss';

// Where each offer leads. None is decided yet; an undefined one renders as
// a button that goes nowhere.
const DESTINATIONS: Record<
  'spriteLab' | 'elementary' | 'middleSchool' | 'certificate' | 'ai101',
  string | undefined
> = {
  spriteLab: undefined,
  elementary: undefined,
  middleSchool: undefined,
  certificate: undefined,
  ai101: undefined,
};

const TITLE_ID = 'hoai2026-congrats-title';

/** Button props that make an external link of a destination, once it has one. */
function linkProps(href: string | undefined): Partial<MuiButtonProps> {
  return href ? {href, target: '_blank', rel: 'noopener noreferrer'} : {};
}

const ExternalIcon = () => (
  <FontAwesomeV6Icon iconName="arrow-up-right-from-square" iconStyle="solid" />
);

const Resource: React.FunctionComponent<{
  grade: string;
  name: string;
  href: string | undefined;
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
}> = ({icon, title, text, children}) => (
  <section className={styles.offer} aria-label={title}>
    <Typography component="h3" variant="h5" className={styles.offerTitle}>
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

/**
 * The finish dialog for the 2026 Hour of AI Sprite Lab activity: what the
 * student can do next, and what their teacher can.
 */
const Hoai2026Congrats: React.FunctionComponent<FinishDialogProps> = ({
  onClose,
  shareUrl,
  projectType,
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
      {i18n.congratulations()}
    </Typography>
    <hr className={styles.rule} />
    <div className={styles.body}>
      <Typography
        id="dsco-dialog-description"
        variant="body2"
        className={styles.intro}
      >
        You made sprites with AI, built a world and coded your own game.
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
            Make your own game in Sprite Lab
          </Typography>
          <div>
            <MuiButton
              variant="contained"
              color="white"
              size="large"
              className={styles.open}
              endIcon={
                <FontAwesomeV6Icon iconName="arrow-right" iconStyle="solid" />
              }
              {...linkProps(DESTINATIONS.spriteLab)}
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
          <MuiButton
            variant="outlined"
            color="secondary"
            {...linkProps(DESTINATIONS.certificate)}
          >
            Certificate
          </MuiButton>
        </Offer>
        <Offer
          icon="lightbulb"
          title="AI 101 for teachers"
          text="Learn to teach with AI."
        >
          <MuiButton
            variant="outlined"
            color="secondary"
            endIcon={<ExternalIcon />}
            {...linkProps(DESTINATIONS.ai101)}
          >
            Start AI 101
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
        {i18n.keepPlaying()}
      </MuiButton>
    </div>
  </MuiCustomDialog>
);

export default Hoai2026Congrats;

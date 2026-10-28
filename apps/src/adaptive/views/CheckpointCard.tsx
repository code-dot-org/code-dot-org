import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {
  CheckpointStatus,
  CheckpointStatusMap,
  STATUS_LABELS,
} from '../progress';
import {PathwayEvidence} from '../routing/evidence';
import {Checkpoint, Pathway} from '../types';

import styles from './checkpointCard.module.scss';
import shared from './shared.module.scss';

const PILL_CLASSES: {[status in CheckpointStatus]: string | undefined} = {
  locked: undefined,
  available: styles.pillAvailable,
  inProgress: styles.pillInProgress,
  complete: styles.pillComplete,
  skipped: styles.pillSkipped,
};

const ACTION_LABELS: {
  [status in Exclude<CheckpointStatus, 'locked'>]: string;
} = {
  available: 'Start',
  inProgress: 'Continue',
  complete: 'Review',
  skipped: 'Open anyway',
};

interface CheckpointCardProps {
  pathway: Pathway;
  checkpoint: Checkpoint;
  status: CheckpointStatus;
  statusMap: CheckpointStatusMap;
  /** What the student has shown, for explaining a skipped checkpoint. */
  evidence: PathwayEvidence;
  onStart: () => void;
  /** Zooms the map onto another checkpoint. */
  onSelectCheckpoint: (id: string) => void;
}

const CheckpointCard: React.FunctionComponent<CheckpointCardProps> = ({
  pathway,
  checkpoint,
  status,
  statusMap,
  evidence,
  onStart,
  onSelectCheckpoint,
}) => {
  const skills = (checkpoint.skillIds || [])
    .map(id => pathway.skills[id])
    .filter(Boolean);
  const standards = skills.flatMap(s => s.standards || []);
  const requires = (checkpoint.requires || [])
    .map(id => pathway.checkpoints.find(c => c.id === id))
    .filter((c): c is Checkpoint => !!c);
  const shownIn =
    status === 'skipped'
      ? checkpointsShowing(
          pathway,
          evidence,
          skills.map(s => s.id)
        )
      : [];

  return (
    <div className={shared.card}>
      <span className={classNames(styles.statusPill, PILL_CLASSES[status])}>
        {STATUS_LABELS[status]}
      </span>
      <MuiTypography variant="h4">{checkpoint.title}</MuiTypography>
      {skills.length > 0 && (
        <Tags
          tagsList={skills.map(s => ({key: s.id, label: s.title}))}
          size="s"
        />
      )}
      <MuiTypography variant="body3">{checkpoint.description}</MuiTypography>
      {status === 'skipped' && (
        <MuiTypography variant="body3" className={styles.skippedReason}>
          Skipped! You already demonstrated an understanding of{' '}
          {joinWithAnd(skills.map(s => <strong key={s.id}>{s.title}</strong>))}
          {shownIn.length > 0 && (
            <>
              {' in checkpoint '}
              {joinWithAnd(
                shownIn.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className={styles.linkButton}
                    onClick={() => onSelectCheckpoint(c.id)}
                  >
                    {c.title}
                  </button>
                ))
              )}
            </>
          )}
          .
        </MuiTypography>
      )}

      {standards.length > 0 && (
        <>
          <MuiTypography variant="strong">Standards</MuiTypography>
          <ul className={shared.plainList}>
            {standards.map(s => (
              <li key={`${s.framework}/${s.shortcode}`}>
                <MuiTypography variant="body4">
                  <strong>{s.shortcode}</strong> {s.description}
                </MuiTypography>
              </li>
            ))}
          </ul>
        </>
      )}

      {requires.length > 0 && (
        <>
          <MuiTypography variant="strong">Requires</MuiTypography>
          <ul className={shared.plainList}>
            {requires.map(c => {
              const done =
                statusMap[c.id] === 'complete' || statusMap[c.id] === 'skipped';
              return (
                <li key={c.id} className={styles.requirement}>
                  <FontAwesomeV6Icon
                    iconName={done ? 'circle-check' : 'circle-play'}
                    className={classNames(
                      styles.requirementIcon,
                      done && styles.requirementDone
                    )}
                  />
                  <button
                    type="button"
                    className={classNames(
                      styles.linkButton,
                      done && styles.struck
                    )}
                    onClick={() => onSelectCheckpoint(c.id)}
                  >
                    {c.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {status !== 'locked' && (
        <MuiButton
          id="adaptive-checkpoint-card-start"
          variant="contained"
          onClick={onStart}
        >
          {ACTION_LABELS[status]}
        </MuiButton>
      )}
    </div>
  );
};

/**
 * The checkpoints whose steps showed the evidence for these skills, in
 * authored order; none when nothing has been shown.
 */
function checkpointsShowing(
  pathway: Pathway,
  evidence: PathwayEvidence,
  skillIds: string[]
): Checkpoint[] {
  const stepIds = skillIds.flatMap(id =>
    (evidence[id]?.from ?? []).map(pointer => pointer.stepId)
  );
  return pathway.checkpoints.filter(c =>
    c.steps.some(step => stepIds.includes(step.id))
  );
}

/** The nodes in a sentence, separated by " and ". */
function joinWithAnd(nodes: React.ReactNode[]): React.ReactNode[] {
  return nodes.flatMap((node, i) => (i === 0 ? [node] : [' and ', node]));
}

export default CheckpointCard;

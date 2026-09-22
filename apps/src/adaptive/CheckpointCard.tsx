import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {CheckpointStatus, STATUS_LABELS} from './progress';
import {Checkpoint, Pathway} from './types';

import moduleStyles from './pathway.module.scss';

const PILL_CLASSES: {[status in CheckpointStatus]: string | undefined} = {
  locked: undefined,
  available: moduleStyles.pillAvailable,
  inProgress: moduleStyles.pillInProgress,
  complete: moduleStyles.pillComplete,
};

const ACTION_LABELS: {[status in CheckpointStatus]: string} = {
  locked: 'Locked',
  available: 'Start',
  inProgress: 'Continue',
  complete: 'Review',
};

interface CheckpointCardProps {
  pathway: Pathway;
  checkpoint: Checkpoint;
  status: CheckpointStatus;
  onStart: () => void;
}

const CheckpointCard: React.FunctionComponent<CheckpointCardProps> = ({
  pathway,
  checkpoint,
  status,
  onStart,
}) => {
  const skills = (checkpoint.skillIds || [])
    .map(id => pathway.skills[id])
    .filter(Boolean);
  const standards = skills.flatMap(s => s.standards || []);
  const unlocks = (checkpoint.unlocks || [])
    .map(id => pathway.abilities[id])
    .filter(Boolean);
  const requires = (checkpoint.requires || []).map(
    id => pathway.checkpoints.find(c => c.id === id)?.title || id
  );

  return (
    <div className={moduleStyles.card}>
      <span
        className={classNames(moduleStyles.statusPill, PILL_CLASSES[status])}
      >
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

      {unlocks.length > 0 && (
        <>
          <MuiTypography variant="strong">
            {status === 'complete' ? 'Unlocked' : 'Unlocks'}
          </MuiTypography>
          <ul className={moduleStyles.plainList}>
            {unlocks.map(a => (
              <li key={a.id} className={moduleStyles.abilityItem}>
                <span
                  className={classNames(
                    moduleStyles.abilityIcon,
                    status === 'complete' && moduleStyles.abilityIconUnlocked
                  )}
                >
                  <FontAwesomeV6Icon iconName={a.icon || 'unlock'} />
                </span>
                <MuiTypography variant="body3">
                  <strong>{a.title}</strong>
                  <br />
                  <span className={moduleStyles.muted}>{a.description}</span>
                </MuiTypography>
              </li>
            ))}
          </ul>
        </>
      )}

      {standards.length > 0 && (
        <>
          <MuiTypography variant="strong">Standards</MuiTypography>
          <ul className={moduleStyles.plainList}>
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

      {status === 'locked' ? (
        <MuiTypography variant="body4" className={moduleStyles.muted}>
          Complete {requires.join(' and ')} to unlock this checkpoint.
        </MuiTypography>
      ) : (
        <MuiButton variant="contained" onClick={onStart}>
          {ACTION_LABELS[status]}
        </MuiButton>
      )}
    </div>
  );
};

export default CheckpointCard;

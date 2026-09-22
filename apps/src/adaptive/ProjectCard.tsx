import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import EditableText from './EditableText';
import {CheckpointStatus, ProjectMeta} from './progress';
import {SAMPLE_PROJECT_HTML} from './sampleProject';
import {Pathway} from './types';
import UnlockHint from './UnlockHint';

import moduleStyles from './pathway.module.scss';

interface ProjectCardProps {
  pathway: Pathway;
  statuses: {[id: string]: CheckpointStatus};
  project: ProjectMeta;
  onEditProject: (patch: Partial<ProjectMeta>) => void;
  onOpenProject: () => void;
  onSelectCheckpoint: (id: string) => void;
}

const ProjectCard: React.FunctionComponent<ProjectCardProps> = ({
  pathway,
  statuses,
  project,
  onEditProject,
  onOpenProject,
  onSelectCheckpoint,
}) => {
  const completed = pathway.checkpoints.filter(
    c => statuses[c.id] === 'complete'
  );
  const unlocked = new Set(completed.flatMap(c => c.unlocks || []));
  const abilities = Object.values(pathway.abilities);

  return (
    <div className={moduleStyles.card}>
      <MuiTypography variant="overline1">My Project</MuiTypography>
      <EditableText
        value={project.title}
        label="project title"
        variant="h4"
        onSave={title => onEditProject({title})}
      />
      <EditableText
        value={project.description}
        label="project description"
        variant="body3"
        multiline
        className={moduleStyles.muted}
        onSave={description => onEditProject({description})}
      />
      <div className={moduleStyles.thumbnail}>
        <iframe
          className={moduleStyles.thumbnailFrame}
          title="Latest project progress"
          sandbox=""
          srcDoc={SAMPLE_PROJECT_HTML}
          tabIndex={-1}
        />
      </div>
      <MuiTypography variant="strong">Tools Available</MuiTypography>
      <ul className={moduleStyles.plainList}>
        {abilities.map(a => {
          const on = unlocked.has(a.id);
          return (
            <li key={a.id} className={moduleStyles.abilityItem}>
              <span
                className={classNames(
                  moduleStyles.abilityIcon,
                  on
                    ? moduleStyles.abilityIconUnlocked
                    : moduleStyles.abilityIconLocked
                )}
              >
                <FontAwesomeV6Icon
                  iconName={on ? a.icon || 'unlock' : 'lock'}
                />
              </span>
              <MuiTypography variant="body3">
                <strong>{a.title}</strong>
                <br />
                <span className={moduleStyles.muted}>
                  {on ? (
                    a.description
                  ) : (
                    <UnlockHint
                      pathway={pathway}
                      abilityId={a.id}
                      onSelectCheckpoint={onSelectCheckpoint}
                    />
                  )}
                </span>
              </MuiTypography>
            </li>
          );
        })}
      </ul>
      <MuiButton
        variant="contained"
        disabled={completed.length === 0}
        onClick={onOpenProject}
      >
        Work on my Project
      </MuiButton>
    </div>
  );
};

export default ProjectCard;

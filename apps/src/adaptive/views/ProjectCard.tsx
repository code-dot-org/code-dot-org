import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React from 'react';

import {Channel} from '@cdo/apps/lab2/types';

import {ProjectEdits, projectDescription} from '../project';

import EditableText from './components/EditableText';

import styles from './shared.module.scss';

interface ProjectCardProps {
  project: Channel;
  onEditProject: (edits: ProjectEdits) => void;
}

const ProjectCard: React.FunctionComponent<ProjectCardProps> = ({
  project,
  onEditProject,
}) => (
  <div className={styles.card}>
    <MuiTypography variant="overline1">My Project</MuiTypography>
    <EditableText
      value={project.name}
      label="project title"
      variant="h4"
      onSave={name => onEditProject({name})}
    />
    <EditableText
      value={projectDescription(project)}
      label="project description"
      variant="body3"
      multiline
      className={styles.muted}
      onSave={description => onEditProject({description})}
    />
    <MuiTypography variant="body4" className={styles.muted}>
      Project editing and saving coming soon.
    </MuiTypography>
    <MuiButton variant="contained" disabled>
      Work on my Project
    </MuiButton>
  </div>
);

export default ProjectCard;

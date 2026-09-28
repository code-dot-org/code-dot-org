import {
  Button as MuiButton,
  Skeleton as MuiSkeleton,
  Typography as MuiTypography,
} from '@mui/material';
import React from 'react';

import {PathwayProjectState} from '../project/usePathwayProject';
import {Pathway} from '../types';

import EditableText from './components/EditableText';

import styles from './shared.module.scss';

// A new channel has no name; the first edit gives it one.
const DEFAULT_NAME = 'My Website';
const DEFAULT_DESCRIPTION = 'Add details about your project vision here!';

interface ProjectCardProps extends PathwayProjectState {
  pathway: Pathway;
  onWorkOnProject: () => void;
}

const ProjectCard: React.FunctionComponent<ProjectCardProps> = ({
  pathway,
  channel,
  isLoading,
  isEditable,
  loadError,
  editProject,
  onWorkOnProject,
}) => {
  const templateLevel = pathway.project.levelProperties;
  const name = channel?.name || DEFAULT_NAME;
  const description =
    channel?.labConfig?.adaptive?.description || DEFAULT_DESCRIPTION;

  const status = !templateLevel
    ? `Template level '${pathway.project.templateLevel}' was not found.`
    : loadError
    ? 'Your project could not be loaded.'
    : !isLoading && !channel
    ? 'This student has not started their project yet.'
    : undefined;

  return (
    <div className={styles.card}>
      <MuiTypography variant="overline1">My Project</MuiTypography>
      {channel && isEditable ? (
        <>
          <EditableText
            value={name}
            label="project title"
            variant="h4"
            onSave={name => editProject({name})}
          />
          <EditableText
            value={description}
            label="project description"
            variant="body3"
            multiline
            className={styles.muted}
            onSave={description => editProject({description})}
          />
        </>
      ) : channel ? (
        <>
          <MuiTypography variant="h4">{name}</MuiTypography>
          <MuiTypography variant="body3" className={styles.muted}>
            {description}
          </MuiTypography>
        </>
      ) : (
        isLoading && (
          <>
            <MuiSkeleton variant="text" width="60%" height={32} />
            <MuiSkeleton variant="text" width="100%" />
            <MuiSkeleton variant="text" width="80%" />
          </>
        )
      )}
      {status && (
        <MuiTypography variant="body4" className={styles.muted}>
          {status}
        </MuiTypography>
      )}
      <MuiButton
        variant="contained"
        disabled={!templateLevel || (!isLoading && !channel)}
        onClick={onWorkOnProject}
      >
        Work on my Project
      </MuiButton>
    </div>
  );
};

export default ProjectCard;

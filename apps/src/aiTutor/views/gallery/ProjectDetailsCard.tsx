import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC} from 'react';

import {assetWithUrl} from './assetUtils';
import ReactionChips from './ReactionChips';
import {ChallengeResponseDetail} from './types';

import styles from './project-view.module.scss';

interface ProjectDetailsCardProps {
  detail: ChallengeResponseDetail;
  // The position of the project's unit within the course, for the
  // "Unit N, Lesson M" label. Null when the unit is unknown.
  unitPosition: number | null;
}

interface DetailTag {
  label: string;
  className: string;
}

// The design's sentiment-colored modality tags have no design-system
// equivalent (DSCO Tags come in one fixed color), so these stay custom.
const detailTags = (detail: ChallengeResponseDetail): DetailTag[] => {
  if (assetWithUrl(detail, 'video')) {
    return [{label: 'Video Story', className: styles.tagInfo}];
  }
  const tags: DetailTag[] = [
    {label: 'Whiteboard', className: styles.tagWarning},
  ];
  if (assetWithUrl(detail, 'audio')) {
    tags.push({label: 'Audio', className: styles.tagOrange});
  }
  if (detail.student_text) {
    tags.push({label: 'Text', className: styles.tagSuccess});
  }
  return tags;
};

// The details footer on the project page: the unit/lesson label, modality
// tags, the author, the challenge prompt, and the class's reactions.
const ProjectDetailsCard: FC<ProjectDetailsCardProps> = ({
  detail,
  unitPosition,
}) => (
  <div className={styles.detailsWrapper}>
    <div className={styles.detailsCard}>
      <div className={styles.detailsMeta}>
        <div className={styles.detailsMetaRow}>
          {unitPosition !== null && detail.lesson_position !== null && (
            <Typography
              variant="overline3"
              component="span"
              className={styles.unitLabel}
            >
              Unit {unitPosition}, Lesson {detail.lesson_position}
            </Typography>
          )}
          <div className={styles.tags}>
            {detailTags(detail).map(tag => (
              <Typography
                key={tag.label}
                variant="label3"
                component="span"
                className={classNames(styles.tag, tag.className)}
              >
                {tag.label}
              </Typography>
            ))}
          </div>
        </div>
        <Typography
          variant="label1"
          component="p"
          className={styles.studentName}
        >
          {detail.user_name}
        </Typography>
      </div>
      {detail.question && (
        <Typography variant="body3" className={styles.projectPrompt}>
          Project Prompt: {detail.question}
        </Typography>
      )}
      <ReactionChips reactions={[]} />
    </div>
  </div>
);

export default ProjectDetailsCard;

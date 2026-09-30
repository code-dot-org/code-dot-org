import {ClassGalleryProject} from '@code-dot-org/lesson-deep-dive';
import classNames from 'classnames';
import React, {FC} from 'react';

import {PROJECT_TYPE_MAP} from '@cdo/apps/templates/projects/projectTypeMap';
import {getProjectCardImageUrl} from '@cdo/apps/templates/projects/projectUtils';

import ReactionChips from './ReactionChips';
import {classGalleryProjectReactionsPath} from './reactionsApi';

import styles from './challenge-gallery.module.scss';

interface ClassProjectCardProps {
  project: ClassGalleryProject;
  unitPosition: number | null;
}

const labName = (projectType: string | null): string | null =>
  (projectType &&
    (PROJECT_TYPE_MAP as Record<string, string | undefined>)[projectType]) ||
  null;

// One project in the class gallery: its thumbnail, or the lab's placeholder
// when it has none, the unit/lesson label and lab, the author, and the
// class's reactions. The thumbnail and the author's name open the project's
// share page in a new tab.
const ClassProjectCard: FC<ClassProjectCardProps> = ({
  project,
  unitPosition,
}) => {
  const lab = labName(project.project_type);
  const image = (
    <img
      className={classNames(
        styles.media,
        !project.thumbnail_url && styles.placeholderMedia
      )}
      src={getProjectCardImageUrl(
        project.thumbnail_url ?? '',
        project.project_type ?? ''
      )}
      alt={`${project.user_name}'s project`}
    />
  );

  return (
    <div className={classNames(styles.card, styles.classProjectCard)}>
      {project.share_path ? (
        <a
          href={project.share_path}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
        >
          {image}
        </a>
      ) : (
        image
      )}
      <div className={styles.details}>
        <div className={styles.metaRow}>
          {unitPosition !== null && project.lesson_position !== null && (
            <span className={styles.unitLabel}>
              Unit {unitPosition}, Lesson {project.lesson_position}
            </span>
          )}
          {lab && (
            <div className={styles.tags}>
              <span className={classNames(styles.tag, styles.tagBrand)}>
                {lab}
              </span>
            </div>
          )}
        </div>
        <p className={styles.name}>
          {project.share_path ? (
            <a
              className={styles.nameLink}
              href={project.share_path}
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.user_name}
            </a>
          ) : (
            project.user_name
          )}
        </p>
        <ReactionChips
          reactionsPath={classGalleryProjectReactionsPath(project.channel)}
          reactions={project.reactions}
        />
      </div>
    </div>
  );
};

export default ClassProjectCard;

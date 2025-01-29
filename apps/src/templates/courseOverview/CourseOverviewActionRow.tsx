import React from 'react';

import ResourcesDropdown from '@cdo/apps/code-studio/components/progress/ResourcesDropdown';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import i18n from '@cdo/locale';

import * as utils from '../../utils';
import MultipleAssignButton from '../MultipleAssignButton';
import AssignmentVersionSelector from '../teacherDashboard/AssignmentVersionSelector';

import styles from './course-overview.module.scss';

interface CourseVersion {
  id: number;
  name: string;
  path: string;
}

interface CourseOverviewActionRowProps {
  courseId: number;
  courseOfferingId: number;
  courseVersionId: number;
  versions: CourseVersion[];
  teacherResources: object[];
  studentResources: object[];
  isInstructor: boolean;
  viewAs: keyof typeof ViewType;
  showAssignButton: boolean;
  title: string;
  participantAudience: string;
}

const CourseOverviewActionRow: React.FC<CourseOverviewActionRowProps> = ({
  courseId,
  versions,
  courseOfferingId,
  courseVersionId,
  teacherResources,
  studentResources,
  isInstructor,
  viewAs,
  showAssignButton,
  title,
  participantAudience,
}) => {
  const [confirmationMessageOpen, setConfirmationMessageOpen] =
    React.useState(false);

  const onChangeVersion = React.useCallback(
    (versionId: number) => {
      const version = versions[versionId];
      if (versionId !== courseVersionId && version) {
        const sectionId = queryParams('section_id');
        const queryString = sectionId ? `?section_id=${sectionId}` : '';
        utils.navigateToHref(`${version.path}${queryString}`);
      }
    },
    [courseVersionId, versions]
  );

  return (
    <div className={styles.actionRow}>
      {Object.values(versions).length > 1 && (
        <AssignmentVersionSelector
          onChangeVersion={onChangeVersion}
          courseVersions={versions}
          rightJustifiedPopupMenu={true}
          selectedCourseVersionId={courseVersionId}
        />
      )}
      {isInstructor && teacherResources.length > 0 && (
        <div className={styles.teacherResources}>
          <ResourcesDropdown
            resources={teacherResources}
            unitGroupId={courseId}
          />
        </div>
      )}
      {!isInstructor && studentResources && studentResources.length > 0 && (
        <div className={styles.studentResources}>
          <ResourcesDropdown
            resources={studentResources}
            unitGroupId={courseId}
            studentFacing
          />
        </div>
      )}

      {isInstructor && viewAs === ViewType.Instructor && showAssignButton && (
        <div className={styles.assignButton}>
          {confirmationMessageOpen && <span>{i18n.assignSuccess()}</span>}
          <MultipleAssignButton
            courseOfferingId={courseOfferingId}
            courseVersionId={courseVersionId}
            courseId={courseId}
            scriptId={null}
            assignmentName={title}
            reassignConfirm={() => setConfirmationMessageOpen(true)}
            isAssigningCourse={true}
            isStandAloneUnit={false}
            participantAudience={participantAudience}
          />
        </div>
      )}
    </div>
  );
};

export default CourseOverviewActionRow;

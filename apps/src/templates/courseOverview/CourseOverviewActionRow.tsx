import React from 'react';

import ResourcesDropdown from '@cdo/apps/code-studio/components/progress/ResourcesDropdown';
import {queryParams} from '@cdo/apps/code-studio/utils';

import * as utils from '../../utils';
import AssignmentVersionSelector from '../teacherDashboard/AssignmentVersionSelector';

interface CourseVersion {
  id: number;
  name: string;
  path: string;
}

interface CourseOverviewActionRowProps {
  courseId: number;
  courseVersionId: number;
  versions: CourseVersion[];
  teacherResources: object[];
  studentResources: object[];
  isInstructor: boolean;
  unitGroupId: number;
}

const CourseOverviewActionRow: React.FC<CourseOverviewActionRowProps> = ({
  courseId,
  versions,
  courseVersionId,
  teacherResources,
  studentResources,
  isInstructor,
}) => {
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
    <div>
      {Object.values(versions).length > 1 && (
        <AssignmentVersionSelector
          onChangeVersion={onChangeVersion}
          courseVersions={versions}
          rightJustifiedPopupMenu={true}
          selectedCourseVersionId={courseVersionId}
        />
      )}
      {isInstructor && teacherResources.length > 0 && (
        <ResourcesDropdown
          resources={teacherResources}
          unitGroupId={courseId}
        />
      )}
      {!isInstructor && studentResources && studentResources.length > 0 && (
        <ResourcesDropdown
          resources={studentResources}
          unitGroupId={courseId}
          studentFacing
        />
      )}
      {/* 
      {isTeacher && viewAs === ViewType.Instructor && showAssignButton && (
        <MultipleAssignButton
          sectionId={selectedSectionId}
          courseOfferingId={courseOfferingId}
          courseVersionId={courseVersionId}
          courseId={courseId}
          scriptId={null}
          assignmentName={title}
          sectionName={selectedSection.name}
          reassignConfirm={this.onReassignConfirm}
          isAssigningCourse={false}
          isStandAloneUnit={false}
          participantAudience={participantAudience}
        />
      )} */}
    </div>
  );
};

export default CourseOverviewActionRow;

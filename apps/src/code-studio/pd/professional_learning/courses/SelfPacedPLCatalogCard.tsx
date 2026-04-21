import {Button as MuiButton} from '@mui/material';
import React from 'react';

import SelfPacedPLCatalogCourseFacilitatedWorkshops from '@cdo/apps/code-studio/pd/professional_learning/courses/SelfPacedPLCatalogCourseFacilitatedWorkshops';
import CourseOfferingCard from '@cdo/apps/templates/courseOfferings/courseCard/CourseOfferingCard';
import {CourseOffering} from '@cdo/apps/templates/courseOfferings/types';
import {defaultImageSrc} from '@cdo/apps/templates/curriculumCatalog/curriculumCatalogConstants';
import i18n from '@cdo/locale';

import moduleStyles from './selfPacedPLCatalog.module.scss';

interface SelfPacedPLCatalogCardProps {
  updateExpandedCardKey: (key: string) => void;
  courseOffering: CourseOffering;
  isExpanded?: boolean;
  getRelatedCurriculumsForPLCourse: (
    course: CourseOffering
  ) => CourseOffering[];
}

const SelfPacedPLCatalogCardInitial: React.FunctionComponent<
  SelfPacedPLCatalogCardProps
> = ({
  updateExpandedCardKey,
  isExpanded,
  courseOffering,
  getRelatedCurriculumsForPLCourse,
}) => {
  const courseOfferingDurationInHours = courseOffering.duration_in_hours || 0;

  const courseOfferingDurationLabel = `${courseOfferingDurationInHours} hour${
    courseOfferingDurationInHours > 1 ? 's' : ''
  }`;

  return (
    <CourseOfferingCard
      isExpanded={isExpanded}
      getRelatedCurriculums={getRelatedCurriculumsForPLCourse}
      courseOffering={courseOffering}
      isThisCourseForTeachers
      courseDurationLabel={courseOfferingDurationLabel}
      defaultImageSrc={defaultImageSrc}
      actionRowContent={
        <>
          <MuiButton
            variant="outlined"
            color="tertiary"
            size="medium"
            onClick={() => updateExpandedCardKey(courseOffering.key)}
            type="button"
          >
            {i18n.quickView()}
          </MuiButton>
          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            href={courseOffering.course_version_path}
          >
            {'Start'}
          </MuiButton>
        </>
      }
      relatedProposalsHeader="Facilitated workshops"
      relatedProposalsContent={
        <SelfPacedPLCatalogCourseFacilitatedWorkshops
          facilitated_workshops={courseOffering.facilitated_workshops || []}
        />
      }
      onCloseExpandedCard={() => updateExpandedCardKey(courseOffering.key)}
      expandedCardActionRowContent={
        <>
          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            className={moduleStyles.plCatalogExpandedCardStartLearningButton}
            href={courseOffering.course_version_path}
          >
            {'Start professional learning'}
          </MuiButton>
        </>
      }
    />
  );
};

export default SelfPacedPLCatalogCardInitial;

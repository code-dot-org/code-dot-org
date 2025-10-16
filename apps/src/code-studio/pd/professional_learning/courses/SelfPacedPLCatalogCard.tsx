import {
  Button,
  LinkButton,
  buttonColors,
} from '@code-dot-org/component-library/button';
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
          <Button
            onClick={() => updateExpandedCardKey(courseOffering.key)}
            text={i18n.quickView()}
            size="m"
            type="secondary"
            color="gray"
          />
          <LinkButton
            text="Start"
            href={courseOffering.course_version_path}
            color={buttonColors.purple}
          />
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
          <LinkButton
            text="Start professional learning"
            href={courseOffering.course_version_path}
            color={buttonColors.purple}
            size="m"
            className={moduleStyles.plCatalogExpandedCardStartLearningButton}
          />
        </>
      }
    />
  );
};

export default SelfPacedPLCatalogCardInitial;

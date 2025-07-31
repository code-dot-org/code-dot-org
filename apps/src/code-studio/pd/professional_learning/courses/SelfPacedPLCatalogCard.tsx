import {
  Button,
  LinkButton,
  buttonColors,
} from '@code-dot-org/component-library/button';
import React from 'react';

import CourseOfferingCard from '@cdo/apps/templates/courseOfferings/courseCard/CourseOfferingCard';
import {CourseOffering} from '@cdo/apps/templates/courseOfferings/types';
import {defaultImageSrc} from '@cdo/apps/templates/curriculumCatalog/curriculumCatalogConstants';
import i18n from '@cdo/locale';

import moduleStyles from './selfPacedPLCatalog.module.scss';

interface SelfPacedPLCatalogCardProps {
  updateExpandedCardKey: (key: string) => void;
  courseOffering: CourseOffering;
  isExpanded?: boolean;
}

const SelfPacedPLCatalogCardInitial: React.FunctionComponent<
  SelfPacedPLCatalogCardProps
> = ({updateExpandedCardKey, isExpanded, courseOffering}) => {
  const courseOfferingDurationInHours = courseOffering.duration_in_hours || 0;

  const courseOfferingDurationLabel = `${courseOfferingDurationInHours} hour${
    courseOfferingDurationInHours > 1 ? 's' : ''
  }`;

  return (
    <CourseOfferingCard
      isExpanded={isExpanded}
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
      // TODO: Should be updated in scope of [ACQ-3455](https://codedotorg.atlassian.net/browse/ACQ-3435)
      relatedProposalsContent="[HARDCODED]"
      onCloseExpandedCard={() => updateExpandedCardKey(courseOffering.key)}
      expandedCardActionRowContent={
        <>
          <LinkButton
            text="Start professional Learning"
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

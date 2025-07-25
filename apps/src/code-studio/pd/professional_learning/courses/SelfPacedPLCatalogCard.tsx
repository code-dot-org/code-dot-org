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

interface SelfPacedPLCatalogCardProps extends CourseOffering {}

const SelfPacedPLCatalogCardInitial: React.FunctionComponent<
  SelfPacedPLCatalogCardProps
> = courseOffering => {
  const courseOfferingDurationInHours = courseOffering.duration_in_hours || 0;

  const courseOfferingDurationLabel = `${courseOfferingDurationInHours} hour${
    courseOfferingDurationInHours > 1 ? 's' : ''
  }`;

  return (
    <CourseOfferingCard
      isThisCourseForTeachers
      courseDurationLabel={courseOfferingDurationLabel}
      actionRowContent={
        <>
          <Button
            onClick={() => console.log('quick view', courseOffering)}
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
      defaultImageSrc={defaultImageSrc}
      {...courseOffering}
    />
  );
};

export default SelfPacedPLCatalogCardInitial;

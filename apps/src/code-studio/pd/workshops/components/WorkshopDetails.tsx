import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';
import {
  Heading2,
  Heading3,
  BodyTwoText,
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {DATA_SHARING_NOTICE} from '@cdo/apps/code-studio/pd/constants';
import {GetWorkshopInfoScriptDataResponse} from '@cdo/apps/code-studio/pd/workshops/types';

import WorkshopFacilitatorsList from './WorkshopFacilitatorsList';
import WorkshopSessionsList from './WorkshsopSessionsList';

import moduleStyles from './../workshopMarketingPage.module.scss';

interface WorkshopDetailsProps
  extends Pick<
    GetWorkshopInfoScriptDataResponse,
    | 'name'
    | 'grade_levels'
    | 'sessions'
    | 'fee'
    | 'prereq'
    | 'description'
    | 'notes'
    | 'course_offerings'
    | 'facilitators'
  > {}

/** Component to display the details of a workshop. */
const WorkshopDetails: React.FC<WorkshopDetailsProps> = ({
  name,
  grade_levels,
  sessions,
  fee,
  prereq,
  description,
  notes,
  course_offerings,
  facilitators,
}) => {
  return (
    <section className={moduleStyles.workshopDetails}>
      <section className={moduleStyles.workshopDetailsItem}>
        <Heading2>{name}</Heading2>
        <div className={moduleStyles.workshopUnderHeadingDetails}>
          <BodyTwoText className={moduleStyles.gradeLevels}>
            <FontAwesomeV6Icon iconName="users" />
            <StrongText>Grades:</StrongText> {grade_levels?.join(', ')}
          </BodyTwoText>
          {prereq && (
            <BodyTwoText className={moduleStyles.prerequisites}>
              <FontAwesomeV6Icon iconName="arrow-up-wide-short" />
              <StrongText>Prerequisites:</StrongText> {prereq}
            </BodyTwoText>
          )}
          <BodyTwoText className={moduleStyles.fee}>
            <FontAwesomeV6Icon iconName="dollar-circle" />
            <StrongText>Cost:</StrongText>{' '}
            {!fee || fee === '0' ? 'Free' : `$${fee}`}
          </BodyTwoText>
        </div>
      </section>

      <hr />

      <section className={moduleStyles.workshopDetailsItem}>
        <Heading3 visualAppearance={'heading-xs'}>
          Sessions in This Workshop
        </Heading3>
        <WorkshopSessionsList sessions={sessions} />
      </section>

      <section className={moduleStyles.workshopDetailsItem}>
        <Heading3 visualAppearance={'heading-xs'}>Description:</Heading3>
        <BodyTwoText>{description}</BodyTwoText>
      </section>

      <section className={moduleStyles.workshopDetailsItem}>
        <Heading3 visualAppearance={'heading-xs'}>Attendee Notes:</Heading3>
        <BodyTwoText>{notes}</BodyTwoText>
      </section>

      {course_offerings && course_offerings.length > 0 && (
        <section className={moduleStyles.workshopDetailsItem}>
          <Heading3 visualAppearance="heading-xs">PL Topics Covered:</Heading3>
          <Tags
            size="s"
            className={moduleStyles.plTopicsTags}
            tagsList={course_offerings.map(course => ({label: course}))}
          />
        </section>
      )}

      <section className={moduleStyles.workshopDetailsItem}>
        <Heading3 visualAppearance="heading-xs">Workshop Facilitators</Heading3>
        <WorkshopFacilitatorsList facilitators={facilitators} />
      </section>

      <section
        id="data-sharing-notice"
        className={moduleStyles.workshopDetailsItem}
      >
        <Heading3 visualAppearance="heading-xs">Data Sharing Notice</Heading3>
        <BodyThreeText>{DATA_SHARING_NOTICE}</BodyThreeText>
      </section>
    </section>
  );
};

export default WorkshopDetails;

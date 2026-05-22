import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';
import {Typography} from '@mui/material';
import React from 'react';

import {DATA_SHARING_NOTICE} from '@cdo/apps/code-studio/pd/constants';
import {WorkshopInfo} from '@cdo/apps/code-studio/pd/workshops/types';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import WorkshopFacilitatorsList from './WorkshopFacilitatorsList';
import WorkshopSessionsList from './WorkshsopSessionsList';

import moduleStyles from './../workshopMarketingPage.module.scss';

interface WorkshopDetailsProps
  extends Pick<
    WorkshopInfo,
    | 'name'
    | 'gradeLevels'
    | 'sessions'
    | 'fee'
    | 'prereq'
    | 'description'
    | 'courseOfferings'
    | 'facilitators'
  > {
  isUserEnrolled?: boolean;
}

/** Component to display the details of a workshop. */
const WorkshopDetails: React.FC<WorkshopDetailsProps> = ({
  name,
  gradeLevels,
  sessions,
  fee,
  prereq,
  description,
  courseOfferings,
  facilitators,
  isUserEnrolled,
}) => {
  return (
    <section className={moduleStyles.workshopDetails}>
      <section className={moduleStyles.workshopDetailsItem}>
        <Typography variant="h2" gutterBottom>
          {name}
        </Typography>
        <div className={moduleStyles.workshopUnderHeadingDetails}>
          <Typography
            className={moduleStyles.gradeLevels}
            variant="body2"
            gutterBottom
          >
            <FontAwesomeV6Icon iconName="users" />
            <Typography variant="strong">Grades:</Typography>{' '}
            {gradeLevels?.join(', ')}
          </Typography>
          {prereq && (
            <Typography
              className={moduleStyles.prerequisites}
              variant="body2"
              gutterBottom
            >
              <FontAwesomeV6Icon iconName="arrow-up-wide-short" />
              <Typography variant="strong">Prerequisites:</Typography> {prereq}
            </Typography>
          )}
          <Typography className={moduleStyles.fee} variant="body2" gutterBottom>
            <FontAwesomeV6Icon iconName="dollar-circle" />
            <Typography variant="strong">Cost:</Typography>{' '}
            {!fee || fee === '0' ? 'Free' : fee}
          </Typography>
        </div>
      </section>
      <hr />
      <section className={moduleStyles.workshopDetailsItem}>
        <Typography component="h3" variant="h6" gutterBottom>
          Sessions in This Workshop
        </Typography>
        <WorkshopSessionsList
          sessions={sessions}
          isUserEnrolled={isUserEnrolled}
        />
      </section>
      <section className={moduleStyles.workshopDetailsItem}>
        <Typography component="h3" variant="h6" gutterBottom>
          Description:
        </Typography>
        <Typography component="div" variant="body2" gutterBottom>
          <SafeMarkdown unwrapped markdown={description} />
        </Typography>
      </section>
      {courseOfferings && courseOfferings.length > 0 && (
        <section className={moduleStyles.workshopDetailsItem}>
          <Typography component="h3" variant="h6" gutterBottom>
            PL Topics Covered:
          </Typography>
          <Tags
            size="s"
            className={moduleStyles.plTopicsTags}
            tagsList={courseOfferings.map(course => ({label: course}))}
          />
        </section>
      )}
      {facilitators && facilitators.length > 0 && (
        <section className={moduleStyles.workshopDetailsItem}>
          <Typography component="h3" variant="h6" gutterBottom>
            Workshop Facilitators
          </Typography>
          <WorkshopFacilitatorsList facilitators={facilitators} />
        </section>
      )}
      <section
        id="data-sharing-notice"
        className={moduleStyles.workshopDetailsItem}
      >
        <Typography component="h3" variant="h6" gutterBottom>
          Data Sharing Notice
        </Typography>
        <Typography variant="body3" gutterBottom>
          {DATA_SHARING_NOTICE}
        </Typography>
      </section>
    </section>
  );
};

export default WorkshopDetails;

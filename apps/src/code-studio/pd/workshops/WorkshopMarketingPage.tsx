import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Heading1} from '@code-dot-org/component-library/typography';
import {
  Breadcrumbs as MUIBreadcrumbs,
  Link as MUILink,
  Typography,
} from '@mui/material';
import React, {useEffect} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

import EnrollInWorkshop from './components/EnrollInWorkshop';
import OrganizerInformation from './components/OrganizerInformation';
import WorkshopDetails from './components/WorkshopDetails';
import WorkshopEventJsonLdData from './components/WorkshopEventJsonLdData';
import {
  UserInfoForWorkshop,
  UserWorkshopEnrollment,
  WorkshopInfo,
} from './types';

import moduleStyles from './workshopMarketingPage.module.scss';

interface WorkshopMarketingPageProps extends WorkshopInfo, UserInfoForWorkshop {
  userEnrollment?: UserWorkshopEnrollment;
}

const WorkshopMarketingPage: React.FunctionComponent<
  WorkshopMarketingPageProps
> = props => {
  const {
    id,
    courseOfferings,
    name,
    course,
    subject,
    format,
    capacity,
    numEnrollments,
    gradeLevels,
    sessions,
    fee,
    prereq,
    description,
    customRegistrationLink,
    regionalPartnerName,
    organizer,
    facilitators,
    userInfo,
    userEnrollment,
  } = props;

  const isUserEnrolled = !!userEnrollment;

  useEffect(() => {
    analyticsReporter.sendEvent(
      isUserEnrolled
        ? EVENTS.WORKSHOP_ENROLLMENT_PAGE_VISITED_BY_ENROLLED_USER_EVENT
        : EVENTS.WORKSHOP_ENROLLMENT_PAGE_VISITED_EVENT,
      {
        'workshop id': id,
      }
    );
  }, [id, isUserEnrolled]);

  return (
    <div className={moduleStyles.workshopMarketingPage}>
      <section className={moduleStyles.header}>
        <MUIBreadcrumbs
          className={moduleStyles.headerBreadcrumbs}
          aria-label="Breadcrumb navigation: workShopMarketingPage-HeaderBreadcrumbs"
          separator={<FontAwesomeV6Icon iconName="chevron-right" />}
          size="m"
        >
          <MUILink
            key="home"
            href="/my-professional-learning"
            color="inherit"
            underline="none"
          >
            <FontAwesomeV6Icon iconName="house" title="Home" />
          </MUILink>
          <MUILink
            href="/professional-learning/workshops/"
            color="inherit"
            underline="none"
          >
            Explore workshops
          </MUILink>
          <Typography component="span" variant="label2">
            Workshop information
          </Typography>
        </MUIBreadcrumbs>
        <Heading1>
          {isUserEnrolled ? 'Workshop information' : 'Register for a workshop'}
        </Heading1>
      </section>
      <div className={moduleStyles.bodyWrapper}>
        <div className={moduleStyles.bodyContainer}>
          <WorkshopDetails
            isUserEnrolled={isUserEnrolled}
            name={name}
            gradeLevels={gradeLevels}
            sessions={sessions}
            fee={fee}
            prereq={prereq}
            description={description}
            courseOfferings={courseOfferings}
            facilitators={facilitators}
          />

          <aside className={moduleStyles.sidebar}>
            <EnrollInWorkshop
              id={id}
              customRegistrationLink={customRegistrationLink}
              capacity={capacity}
              numEnrollments={numEnrollments}
              regionalPartnerName={regionalPartnerName}
              userInfo={userInfo}
              course={course}
              subject={subject}
              name={name}
              format={format}
              sessions={sessions}
              isUserEnrolled={isUserEnrolled}
              userEnrollment={userEnrollment}
            />

            <OrganizerInformation
              organizer={organizer}
              regionalPartnerName={regionalPartnerName}
            />
          </aside>
        </div>
      </div>

      <WorkshopEventJsonLdData {...props} />
    </div>
  );
};

export default WorkshopMarketingPage;

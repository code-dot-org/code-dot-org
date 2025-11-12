import Breadcrumbs from '@code-dot-org/component-library/breadcrumbs';
import {LinkWithText} from '@code-dot-org/component-library/link';
import {Heading1} from '@code-dot-org/component-library/typography';
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

const workshopMarketingBreadcrumbs: LinkWithText[] = [
  {
    text: 'Explore workshops',
    href: '/professional-learning/workshops/',
  },
  {
    text: 'Workshop information',
    href: window.location.pathname,
  },
];

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
        <Breadcrumbs
          name="workShopMarketingPage-HeaderBreadcrumbs"
          size="l"
          showHomeIcon={true}
          homeIconHref="/my-professional-learning"
          breadcrumbs={workshopMarketingBreadcrumbs}
          className={moduleStyles.headerBreadcrumbs}
        />
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

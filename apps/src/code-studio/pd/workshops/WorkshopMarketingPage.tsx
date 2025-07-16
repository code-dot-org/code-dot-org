import Breadcrumbs from '@code-dot-org/component-library/breadcrumbs';
import {LinkWithText} from '@code-dot-org/component-library/link';
import {Heading1} from '@code-dot-org/component-library/typography';
import React from 'react';

import EnrollInWorkshop from './components/EnrollInWorkshop';
import OrganizerInformation from './components/OrganizerInformation';
import WorkshopDetails from './components/WorkshopDetails';
import WorkshopEventJsonLdData from './components/WorkshopEventJsonLdData';
import {
  GetUserInfoForWorkshopResponse,
  GetWorkshopInfoScriptDataResponse,
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

interface WorkshopMarketingPageProps
  extends GetWorkshopInfoScriptDataResponse,
    GetUserInfoForWorkshopResponse {}

const WorkshopMarketingPage: React.FunctionComponent<
  WorkshopMarketingPageProps
> = props => {
  const {
    id,
    course_offerings,
    name,
    course,
    subject,
    format,
    capacity,
    num_enrollments,
    grade_levels,
    sessions,
    fee,
    prereq,
    description,
    notes,
    custom_registration_link,
    regional_partner_name,
    organizer,
    facilitators,
    userInfo,
  } = props;

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
        <Heading1>Register for a workshop</Heading1>
      </section>
      <div className={moduleStyles.bodyWrapper}>
        <div className={moduleStyles.bodyContainer}>
          <WorkshopDetails
            name={name}
            grade_levels={grade_levels}
            sessions={sessions}
            fee={fee}
            prereq={prereq}
            description={description}
            notes={notes}
            course_offerings={course_offerings}
            facilitators={facilitators}
          />

          <aside className={moduleStyles.sidebar}>
            <EnrollInWorkshop
              id={id}
              custom_registration_link={custom_registration_link}
              capacity={capacity}
              num_enrollments={num_enrollments}
              regional_partner_name={regional_partner_name}
              userInfo={userInfo}
              course={course}
              subject={subject}
              name={name}
              format={format}
              sessions={sessions}
            />

            <OrganizerInformation
              organizer={organizer}
              regional_partner_name={regional_partner_name}
            />
          </aside>
        </div>
      </div>

      <WorkshopEventJsonLdData {...props} />
    </div>
  );
};

export default WorkshopMarketingPage;

import Breadcrumbs from '@code-dot-org/component-library/breadcrumbs';
import {LinkWithText} from '@code-dot-org/component-library/link';
import {Heading1} from '@code-dot-org/component-library/typography';
import React from 'react';

import EnrollInWorkshop from './components/EnrollInWorkshop';
import OrganizerInformation from './components/OrganizerInformation';
import WorkshopDetails from './components/WorkshopDetails';
import {GetWorkshopInfoScriptDataResponse} from './types';

import moduleStyles from './workshopMarketingPage.module.scss';

const workshopMarketingBreadcrumbs: LinkWithText[] = [
  {
    text: 'Explore workshops',
    href: '/pd/workshop_dashboard/workshops/',
  },
  {
    text: 'Workshop information',
    href: window.location.pathname,
  },
];

interface WorkshopMarketingPageProps
  extends GetWorkshopInfoScriptDataResponse {}

const WorkshopMarketingPage: React.FunctionComponent<
  WorkshopMarketingPageProps
> = ({
  id,
  course_offerings,
  name,
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
  course,
  subject,
  format,
  location_name,
}) => {
  return (
    <div className={moduleStyles.workshopCatalog}>
      <section className={moduleStyles.header}>
        <Breadcrumbs
          name="workShopMarketingPage-HeaderBreadcrumbs"
          size="l"
          showHomeIcon={true}
          breadcrumbs={workshopMarketingBreadcrumbs}
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
            />

            <OrganizerInformation
              organizer={organizer}
              regional_partner_name={regional_partner_name}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default WorkshopMarketingPage;

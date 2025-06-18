import Breadcrumbs from '@code-dot-org/component-library/breadcrumbs';
import {LinkWithText} from '@code-dot-org/component-library/link';
import {Heading1} from '@code-dot-org/component-library/typography';
import React from 'react';

import EnrollInWorkshop from './components/EnrollInWorkshop';
import OrganizerInformation from './components/OrganizerInformation';
import WorkshopDetails from './components/WorkshopDetails';
import WorkshopEventJsonLdData from './components/WorkshopEventJsonLdData';
import {GetWorkshopInfoScriptDataResponse} from './types';

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

interface WorkshopMarketingPageProps extends GetWorkshopInfoScriptDataResponse {
  is_signed_out: boolean;
  is_student: boolean;
}

const WorkshopMarketingPage: React.FunctionComponent<
  WorkshopMarketingPageProps
> = props => {
  const {
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
    is_signed_out,
    is_student,
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
              is_signed_out={is_signed_out}
              is_student={is_student}
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

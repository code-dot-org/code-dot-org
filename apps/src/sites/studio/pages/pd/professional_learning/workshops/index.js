import React from 'react';
import ReactDOM from 'react-dom';

import WorkshopMarketingPage from '@cdo/apps/code-studio/pd/workshops/WorkshopMarketingPage';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  const workshopInfo = getScriptData('workshopInfo');

  ReactDOM.render(
    <WorkshopMarketingPage
      id={workshopInfo.id}
      course={workshopInfo.course}
      subject={workshopInfo.subject}
      course_offerings={workshopInfo.course_offerings}
      name={workshopInfo.name}
      capacity={workshopInfo.capacity}
      num_enrollments={workshopInfo.num_enrollments}
      grade_levels={workshopInfo.grade_levels}
      sessions={workshopInfo.sessions}
      format={workshopInfo.format}
      location_name={workshopInfo.location_name}
      fee={workshopInfo.fee}
      prereq={workshopInfo.prereq}
      description={workshopInfo.description}
      notes={workshopInfo.notes}
      custom_registration_link={workshopInfo.custom_registration_link}
      regional_partner_name={workshopInfo.regional_partner_name}
      organizer={workshopInfo.organizer}
      facilitators={workshopInfo.facilitators}
      // User type
      is_signed_out={getScriptData('isSignedOut')}
      is_student={getScriptData('isStudent')}
    />,
    document.getElementById('workshop-container')
  );
});

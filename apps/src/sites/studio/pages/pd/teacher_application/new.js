import React from 'react';
import ReactDOM from 'react-dom';
import {TeacherApplication} from '@cdo/apps/code-studio/pd/teacher_application/teacher_application.jsx';
import getScriptData from '@cdo/apps/util/getScriptData';

const applicationData = getScriptData('applicationData');

let schoolDistrictData = {
  ['us-or-international']: '',
  ['school-type']: '',
  ['school-state']: '',
  ['school-district']: '',
  ['school-district-other']: false,
  ['school']: '',
  ['school-other']: false,
  ['school-district-name']: '',
  ['school-name']: '',
  ['school-zipcode']: ''
};

let districtErrorMessageHandler = (message) => {
  document.getElementById('district-error-placeholder').innerHTML = message;
};

ReactDOM.render(
  <TeacherApplication
    schoolDistrictData={schoolDistrictData}
    districtErrorMessageHandler={districtErrorMessageHandler}
    {...applicationData}
  />,
  document.getElementById('application-container')
);

let redrawApplicationFunction = function (event) {
  schoolDistrictData = {
    ['us-or-international']: document.getElementById('us-or-international').value,
    ['school-type']: document.getElementById('school-type').value,
    ['school-state']: document.getElementById('school-state').value,
    ['school-district']: document.querySelector('#school-district input').value,
    ['school-district-other']: document.getElementById('school-district-other').checked,
    ['school']: document.querySelector('#school input').value,
    ['school-other']: document.getElementById('school-other').checked,
    ['school-district-name']: document.getElementById('school-district-name').value,
    ['school-name']: document.getElementById('school-name').value,
    ['school-zipcode']: document.getElementById('school-zipcode').value
  };

  if (schoolDistrictData['school-district'] && !schoolDistrictData['school-district-other']) {
    const selectedCourseButton = document.querySelector('input[name="selectedCourse"]:checked');
    const selectedCourse = selectedCourseButton ? selectedCourseButton.value : 'unselected';

    $.ajax({
      method: "GET",
      url: `/api/v1/regional_partners/${schoolDistrictData['school-district']}/${selectedCourse}.json`
    }).done(data => {
      const regionalPartnerGroup = data ? data['regional_partner']['group'] : undefined;
      const regionalPartnerName = data ? data['regional_partner']['name'] : undefined;
      const workshopDays = data ? data['workshop_days'] : undefined;

      ReactDOM.render(
        <TeacherApplication
          regionalPartnerGroup={regionalPartnerGroup}
          regionalPartnerName={regionalPartnerName}
          workshopDays={workshopDays ? `${regionalPartnerName}: ${workshopDays}` : workshopDays}
          schoolDistrictData={schoolDistrictData}
          districtErrorMessageHandler={districtErrorMessageHandler}
          {...applicationData}
        />,
        document.getElementById('application-container')
      );
    }).fail(data => {
      console.log(`error: ${data}`);
    });
  } else {
    ReactDOM.render(
      <TeacherApplication
        schoolDistrictData={schoolDistrictData}
        districtErrorMessageHandler={districtErrorMessageHandler}
        {...applicationData}
      />,
      document.getElementById('application-container')
    );
  }
};

$('#pl-application-form input,#pl-application-form select,#selectedCourse input').change(redrawApplicationFunction);
$('#school-district-name,#school-name,#school-zipcode').on('input', redrawApplicationFunction);


import React from 'react';
import ReactDOM from 'react-dom';
import TeacherApplication from '@cdo/apps/code-studio/pd/teacher_application/teacher_application.jsx';

ReactDOM.render(<TeacherApplication/>, document.getElementById('application-container'));

$('#school-district,#school-type,#selectedCourse input').change(function () {
  const districtValue = $('#school-district input').val();

  if (districtValue) {
    const selectedCourseButton = document.querySelector('input[name="courseSelection"]:checked');
    const selectedCourse = selectedCourseButton ? selectedCourseButton.value : 'unselected';

    $.ajax({
      method: "GET",
      url: `/api/v1/regional-partners/${districtValue}/${selectedCourse}.json`
    }).done(data => {
      const regionalPartnerGroup = data ? data['group'] : undefined;
      const regionalPartnerName = data ? data['name'] : undefined;

      ReactDOM.render(
        <TeacherApplication
          regionalPartnerGroup={regionalPartnerGroup}
          regionalPartnerName={regionalPartnerName}
        />,
        document.getElementById('application-container')
      );
    }).fail(data => {
      console.log(`error: ${data}`);
    });
  } else {
    ReactDOM.render(<TeacherApplication/>, document.getElementById('application-container'));
  }
});


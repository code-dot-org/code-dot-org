import React from 'react';
import ReactDOM from 'react-dom';
import TeacherApplication from '@cdo/apps/code-studio/pd/teacher_application/teacher_application.jsx';

ReactDOM.render(<TeacherApplication/>, document.getElementById('application-container'));

$('#school-district').change(function () {
  let districtValue = $('#school-district input').val();

  if (districtValue) {
    $.ajax({
      method: "GET",
      url: `/api/v1/regional-partners/${districtValue}.json`
    }).done(data => {
      let regionalPartnerGroup = data ? data['group'] : undefined;
      let regionalPartnerName = data ? data['name'] : undefined;

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


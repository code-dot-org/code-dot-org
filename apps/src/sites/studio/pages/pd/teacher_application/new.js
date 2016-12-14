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
      let regionalPartnerGroup = data['group']
      ReactDOM.render(<TeacherApplication regionalPartnerGroup={regionalPartnerGroup}/>, document.getElementById('application-container'));
    }).fail(data => {
      console.log(`error: ${data}`)
    })
  }
})


import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import YourSchool from '@cdo/apps/templates/census2017/YourSchool';
import {getStore, registerReducers} from '@cdo/apps/redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';

registerReducers({isRtl, responsive});

$(document).ready(showYourSchool);

function showYourSchool() {
  const rawSchoolId = $('#your-school').data("parameters-schoolId");
  const rawSchoolZip = $('#your-school').data("parameters-schoolZip");

  ReactDOM.render(
    <Provider store={getStore()}>
      <YourSchool
        alertHeading={$('#your-school').data("parameters-alert-heading")}
        alertText={$('#your-school').data("parameters-alert-text")}
        alertUrl={$('#your-school').data("parameters-alert-url")}
        hideMap={$('#your-school').data("parameters-hide-map")}
        userName={$('#your-school').data("parameters-user-name")}
        userEmail={$('#your-school').data("parameters-user-email")}
        isTeacher={$('#your-school').data("parameters-is-teacher")}
        schoolCountry={$('#your-school').data("parameters-school-country")}
        schoolId={rawSchoolId ? rawSchoolId.toString() : undefined}
        schoolType={$('#your-school').data("parameters-school-type")}
        schoolName={$('#your-school').data("parameters-school-name")}
        schoolState={$('#your-school').data("parameters-school-state")}
        schoolZip={rawSchoolZip ? rawSchoolZip.toString() : undefined}
      />
    </Provider>,
    $('#your-school')[0]
  );
}

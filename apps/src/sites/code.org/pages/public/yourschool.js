import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import YourSchool from '@cdo/apps/templates/census2017/YourSchool';
import {getStore, registerReducers} from '@cdo/apps/redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import initResponsive from '@cdo/apps/code-studio/responsive';

registerReducers({isRtl, responsive});

$(document).ready(initYourSchool);

function showYourSchool() {
  const rawSchoolId = $('#your-school').data("parameters-schoolId");
  const rawSchoolZip = $('#your-school').data("parameters-schoolZip");
  const yourschoolElement = $('#your-school');
  const prefillData = {
    userName: yourschoolElement.data("parameters-user-name"),
    userEmail: yourschoolElement.data("parameters-user-email"),
    isTeacher: yourschoolElement.data("parameters-is-teacher"),
    schoolCountry: yourschoolElement.data("parameters-school-country"),
    schoolId: rawSchoolId ? rawSchoolId.toString() : undefined,
    schoolType: yourschoolElement.data("parameters-school-type"),
    schoolName: yourschoolElement.data("parameters-school-name"),
    schoolState: yourschoolElement.data("parameters-school-state"),
    schoolZip: rawSchoolZip ? rawSchoolZip.toString() : undefined,
  };

  ReactDOM.render(
    <Provider store={getStore()}>
      <YourSchool
        alertHeading={yourschoolElement.data("parameters-alert-heading")}
        alertText={yourschoolElement.data("parameters-alert-text")}
        alertUrl={yourschoolElement.data("parameters-alert-url")}
        hideMap={yourschoolElement.data("parameters-hide-map")}
        fusionTableId={yourschoolElement.data("parameters-table-id")}
        prefillData={prefillData}
        currentCensusYear={yourschoolElement.data("parameters-school-year")}
      />
    </Provider>,
    yourschoolElement[0]
  );
}

function initYourSchool() {
  initResponsive();
  showYourSchool();
}

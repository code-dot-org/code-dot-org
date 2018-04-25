import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import YourSchool from '@cdo/apps/templates/census2017/YourSchool';
import {getStore, registerReducers} from '@cdo/apps/redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import initResponsive from '@cdo/apps/code-studio/responsive';
import queryString from 'query-string';

registerReducers({isRtl, responsive});

$(document).ready(initYourSchool);

function showYourSchool() {
  const query = queryString.parse(location.search);
  const rawSchoolId = query['schoolId'];
  const rawSchoolZip = query['zip'];
  const yourschoolElement = $('#your-school');
  const prefillData = {
    userName: query['name'],
    userEmail: query['email'],
    isTeacher: query['isTeacher'],
    schoolCountry: query['country'],
    schoolId: rawSchoolId ? rawSchoolId.toString() : undefined,
    schoolType: query['schoolType'],
    schoolName: query['schoolName'],
    schoolState: query['state'],
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

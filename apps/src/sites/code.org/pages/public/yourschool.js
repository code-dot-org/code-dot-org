import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import YourSchool from '@cdo/apps/templates/census2017/YourSchool';
import {getStore, registerReducers} from '@cdo/apps/redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

registerReducers({isRtl});

$(document).ready(showYourSchool);

function showYourSchool() {
  ReactDOM.render(
    <Provider store={getStore()}>
      <YourSchool
        alertHeading={$('#your-school').data("parameters-alert-heading")}
        alertText={$('#your-school').data("parameters-alert-text")}
        alertUrl={$('#your-school').data("parameters-alert-url")}
        hideMap={$('#your-school').data("parameters-hide-map")}
      />
    </Provider>,
    $('#your-school')[0]
  );
}

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import DanceLanding from '@cdo/apps/template/DanceLanding';

$(document).ready(showDancePage);

function showDancePage() {
  ReactDOM.render (
    <DanceLanding/>,
    document.getElementById('dance')
  );
}
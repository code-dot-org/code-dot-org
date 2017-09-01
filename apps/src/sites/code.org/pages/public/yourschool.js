import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import YourSchool from '@cdo/apps/templates/YourSchool';

$(document).ready(showYourSchool);

function showYourSchool() {
  ReactDOM.render (
    <YourSchool/>,
    document.getElementById('your-school')
  );
}


function processResponse() {
  console.log("submission success!");
}

function processError(data) {
  console.log("error submittiing");
}

function CensusFormSubmit(event) {

  $.ajax({
    url: "/forms/Census",
    type: "post",
    dataType: "json",
    data: $('#census-form').serialize()
  }).done(processResponse).fail(processError);

  event.preventDefault();
}

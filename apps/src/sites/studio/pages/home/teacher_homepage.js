import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import GradientNavCard from '@cdo/apps/templates/teacherDashboard/GradientNavCard';

$(document).ready(showContent);


const EXAMPLE_CARD_DATA = {
  title: "Teacher Community",
  description: "Ask questions about curriculum, share ideas from your lessons, and get help from other teachers",
  image: "../../static/navcard-placeholder.png",
  buttonText: "Connect Today",
  link: "link to wherever"
};

function showContent() {

  ReactDOM.render (
    <GradientNavCard
      cardData={EXAMPLE_CARD_DATA}
    />,
    document.getElementById('container')
  );
}

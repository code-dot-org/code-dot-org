import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

$(document).ready(() => {
  const script = document.querySelector('script[data-discountcode]');
  const scriptData = JSON.parse(script.dataset.discountcode);
  console.log(scriptData);

  ReactDOM.render(
    <div> test </div>
    , document.getElementById('discountcode')
  );
});

import React from 'react';
import ReactDOM from 'react-dom';

if (module.hot) {
  module.hot.accept();
}

const Hello = () => <h1>Benjamin</h1>;

$(document).ready(() => {
  ReactDOM.render(<Hello />, document.getElementById('homepage-container'));
});

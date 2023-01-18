import $ from 'jquery';

window.hamlLog = function() {
  const regionalPartnerSearchElement = $('#haml-logger');
  const sourcePageId = regionalPartnerSearchElement.data('page-visited');
  console.log('Logger: ' + sourcePageId);
};

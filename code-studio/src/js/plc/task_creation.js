/* globals dashboard */

var IconLibrary = require('../components/IconLibrary.jsx');

$(window).load(function () {
  $('#toggleIconLibrary').click(function () {
    $('#iconDiv').toggle();
  });

  $('#unsetIcon').click(function () {
    $('#plc_learning_resource_task_icon').val('');
    $('#previewIcon').removeClass();
    $('#iconDiv').toggle();
  });
});


ReactDOM.render(React.createElement(IconLibrary, {
  alignment: 'left',
  assetChosen: function (name) {
    var iconClass = name.substring('icon://'.length);
    $('#plc_learning_resource_task_icon').val(iconClass);
    $('#iconDiv').toggle();
    $('#previewIcon').removeClass().addClass('fa ' + iconClass);
  }

}), document.querySelector('#iconLibraryContainerDiv'));


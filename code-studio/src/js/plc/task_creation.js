/* globals dashboard */

var IconLibrary = require('../components/IconLibrary');
var initializeCodeMirror = require('../initializeCodeMirror');
var marked = require ('marked');

$(window).load(function () {
  $('#toggleIconLibrary').click(function () {
    $('#iconDiv').toggle();
  });

  $('#unsetIcon').click(function () {
    $('#plc_learning_resource_task_icon').val('');
    $('#previewIcon').removeClass();
    $('#iconDiv').toggle();
  });

  if ($('#plc_written_assignment_task_assignment_description').length) {
    var markdownEditor = initializeCodeMirror('plc_written_assignment_task_assignment_description', 'markdown', function (editor, change) {
      $('#assignment_description_preview').html(marked(editor.getValue())).children('details').details();
    }, true);

    $('#assignment_description_preview').html(marked(markdownEditor.getValue())).children('details').details();
  }
});

// TODO: Don't use one monolithic js file
if ($('#iconLibraryContainerDiv').length) {
  ReactDOM.render(React.createElement(IconLibrary, {
    alignment: 'left',
    assetChosen: function (name) {
      var iconClass = name;
      $('#plc_learning_resource_task_icon').val(iconClass);
      $('#iconDiv').toggle();
      $('#previewIcon').removeClass().addClass('fa ' + iconClass);
    }

  }), document.querySelector('#iconLibraryContainerDiv'));
}


import CodeMirror from "codemirror";
import "codemirror/mode/markdown/markdown";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/matchtags";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/fold/xml-fold";
import "codemirror/mode/xml/xml";
import "codemirror/mode/javascript/javascript";
import "@cdo/vendor/js/codemirror.inline-attach";
import "marked";

/* global inlineAttach */

function codeMirror(name, mode, callback, attachments) {
  // Code mirror parses html using xml mode
  var htmlMode = false;
  if (mode === 'html') {
    mode = 'xml';
    htmlMode = true;
  }

  var editor = CodeMirror.fromTextArea(document.getElementById('level_' + name), {
    mode: mode,
    htmlMode: htmlMode,
    viewportMargin: Infinity,
    matchTags: {bothTags: true},
    autoCloseTags: true,
    lineWrapping: true
  });
  if (callback) {
    editor.on('change', callback);
  }
  if (attachments) {
    inlineAttach.attachToCodeMirror(editor, {
      uploadUrl: '/level_assets/upload',
      uploadFieldName: 'file',
      downloadFieldName: 'newAssetUrl',
      allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
      progressText: '![Uploading file...]()',
      urlText: "![]({filename})", // `{filename}` tag gets replaced with URL
      errorText: "Error uploading file",
      extraHeaders: {
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
      }
    });
  }
  return editor;
}
// Export to window
window.codeMirror = codeMirror;

// On page load, specifically for the editor page.
$(function () {
  var callout_editor = CodeMirror.fromTextArea($('#level_callout_json').get(0), {
    mode: 'javascript',
    viewportMargin: Infinity,
    matchBrackets: true
  });

  var calloutJSON = callout_editor.getValue();
  var calloutModel = {
    localization_key: "",
    callout_text: "",
    element_id: "",
    on: "",
    qtip_config: {
      style: {classes: ""},
      position: {
        my: "",
        at: "",
        adjust: {x: 0, y: 0}
      }
    }
  };

  // Create callout spaces for each callout in the original JSON
  if (calloutJSON.length > 0) {
    var callouts_to_update = JSON.parse(callout_editor.getValue());
    $.each(callouts_to_update, function (index, callout) {
      updateTemplate(callout, $createNewCalloutSpace());
    });
  }

  /**
   * For each key in the given model, set the <input> with a matching class name to the key's value.
   * @param {model} The model to use when updating the DOM.
   * @param {$template} The jQuery element to search for <input> elements.
   */
  function updateTemplate(model, $template) {
    $.each(model, function (key, value) {
      if (value && typeof value === 'object') {
        updateTemplate(value, $template);
      } else {
        $template.find('.' + key).val(model[key]);
      }
    });
  }

  /**
   * For each key in the given model, set the key's value to the value of the <input> with a matching class name.
   * @param {model} The model to update from the DOM.
   * @param {$template} The jQuery element to search for <input> elements.
   */
  function updateModel(model, $template) {
    $.each(model, function (key, value) {
      if (typeof value === 'object') {
        updateModel(value, $template);
      } else {
        value = $template.find('.' + key).val();
        model[key] = typeof model[key] === 'number' ? +value : value;
      }
    });
  }

  function updateCalloutJSON() {
    var updated_callouts = [];
    $('#all_callouts_editor .callout_space').each(function () {
      var model = $.extend(true, {}, calloutModel);
      updateModel(model, $(this));
      updated_callouts.push(model);
    });
    callout_editor.setValue(JSON.stringify(updated_callouts, null, ' '));
  }

  function $createNewCalloutSpace() {
    var $newCallout = $("#callout_template").children(":first").clone();
    $("#all_callouts_editor").append($newCallout);
    return $newCallout;
  }

  $(document).on("click", "#add_callout", function () {
    $createNewCalloutSpace();
    updateCalloutJSON();
  });

  $(document).on("click", ".remove_callout", function () {
    $(this).closest(".callout_space").remove();
    updateCalloutJSON();
  });

  $(".callouteditor").on("input", function () {
    updateCalloutJSON();
  });

  var jQuerySuccessConditionBox = $('#level_success_condition');
  if (jQuerySuccessConditionBox.length) {
    CodeMirror.fromTextArea(jQuerySuccessConditionBox.get(0), {
      mode: 'javascript',
      viewportMargin: Infinity,
      matchBrackets: true
    });
  }

  var jQueryFailureConditionBox = $('#level_failure_condition');
  if (jQueryFailureConditionBox.length) {
    CodeMirror.fromTextArea(jQueryFailureConditionBox.get(0), {
      mode: 'javascript',
      viewportMargin: Infinity,
      matchBrackets: true
    });
  }

});

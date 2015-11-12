/* global CodeMirror */

function calloutEditor(container, options) {

  container = $(container);

  var callout_editor = CodeMirror.fromTextArea(container.find(options.json_textarea).get(0), {
    mode: 'javascript',
    viewportMargin: Infinity,
    matchBrackets: true
  });

  // Create callout spaces for each callout in the original JSON
  var calloutJSON = callout_editor.getValue();
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
    if (options.onNewSpace) {
      options.onNewSpace($template);
    }
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
    container.find(options.form_container).find(options.callout_space).each(function () {
      var model = $.extend(true, {}, options.model);
      updateModel(model, $(this));
      updated_callouts.push(model);
    });
    callout_editor.setValue(JSON.stringify(updated_callouts, null, ' '));
  }

  function $createNewCalloutSpace() {
    var $newCallout = container.find(options.template).children(":first").clone();
    container.find(options.form_container).append($newCallout);
    return $newCallout;
  }

  if (options.up_button) {
    container.find(options.up_button).on("click", function () {
      var wrapper = $(this).closest(options.callout_space);
      if (wrapper.prev().length) {
        wrapper.insertBefore(wrapper.prev());
        updateCalloutJSON();
      }
    });
  }

  if (options.down_button) {
    container.find(options.down_button).on("click", function () {
      var wrapper = $(this).closest(options.callout_space);
      if (wrapper.next().length) {
        wrapper.insertAfter(wrapper.next());
        updateCalloutJSON();
      }
    });
  }

  container.find(options.add_button).on("click", function () {
    $createNewCalloutSpace();
    updateCalloutJSON();
  });

  container.on("click", options.remove_button, function () {
    $(this).closest(options.callout_space).remove();
    updateCalloutJSON();
  });

  container.find(options.wrapper).on("change", function () {
    updateCalloutJSON();
  });

}

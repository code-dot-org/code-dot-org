'use strict';
import $ from 'jquery';
var CodeMirror = require('codemirror');

/**
 * "Factory" function to transform a container into an interface for
 * editing lists of JSON values.
 *
 * @param {string} container - jQuery selector for the container
 * @param {Object} options
 * @param {string} options.json_textarea
 * @param {string} options.add_button
 * @param {string} options.remove_button
 * @param {string} options.value_space
 * @param {string} options.template
 * @param {string} options.form_container
 * @param {string} options.wrapper
 * @param {Object} options.model
 */
module.exports = function (container, options) {
  container = $(container);

  var jsonEditor = CodeMirror.fromTextArea(container.find(options.json_textarea).get(0), {
    mode: 'javascript',
    viewportMargin: Infinity,
    matchBrackets: true
  });

  // Create spaces for each element in the original JSON
  var jsonContent = jsonEditor.getValue();
  if (jsonContent.length > 0) {
    var valuesToUpdate = JSON.parse(jsonEditor.getValue());
    $.each(valuesToUpdate, function (index, value) {
      updateTemplate(value, $createNewSpace());
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
        var item = $template.find('.' + key);
        if (item.prop('type') === 'checkbox') {
          item.prop('checked', model[key]);
        } else {
          item.val(model[key]);
        }
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
        var item = $template.find('.' + key);
        if (item.prop('type') === 'checkbox') {
          value = item.prop('checked');
        } else {
          value = item.val();
        }
        model[key] = typeof model[key] === 'number' ? +value : value;
      }
    });
  }

  function updateJSON() {
    var updatedValues = [];
    container.find(options.form_container).find(options.value_space).each(function () {
      var model = $.extend(true, {}, options.model);
      updateModel(model, $(this));
      updatedValues.push(model);
    });
    jsonEditor.setValue(JSON.stringify(updatedValues, null, ' '));
  }

  function $createNewSpace() {
    var $newValue = container.find(options.template).children(":first").clone();
    container.find(options.form_container).append($newValue);
    return $newValue;
  }

  if (options.up_button) {
    container.on("click", options.up_button, function () {
      var wrapper = $(this).closest(options.value_space);
      if (wrapper.prev().length) {
        wrapper.insertBefore(wrapper.prev());
        updateJSON();
      }
    });
  }

  if (options.down_button) {
    container.on("click", options.down_button, function () {
      var wrapper = $(this).closest(options.value_space);
      if (wrapper.next().length) {
        wrapper.insertAfter(wrapper.next());
        updateJSON();
      }
    });
  }

  container.on("click", options.add_button, function () {
    var model = $.extend(true, {}, options.model);
    updateTemplate(model, $createNewSpace());
    updateJSON();
  });

  container.on("click", options.remove_button, function () {
    $(this).closest(options.value_space).remove();
    updateJSON();
  });

  container.on("change", options.wrapper, function () {
    updateJSON();
  });
};

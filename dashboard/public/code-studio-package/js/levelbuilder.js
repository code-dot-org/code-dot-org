require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({183:[function(require,module,exports){
/**
 * @file Main entry point for scripts used on all level editing pages.
 */
'use strict';
var _ = require('lodash');

window.levelbuilder = window.levelbuilder || {};
_.extend(window.levelbuilder, {
  initializeCodeMirror: require('./initializeCodeMirror'),
  jsonEditor: require('./jsonEditor')
});

// TODO: Remove when global `CodeMirror` is no longer required.
window.CodeMirror = require('codemirror');
// TODO: Remove when global `marked` is no longer required.
window.marked = require('marked');

},{"./initializeCodeMirror":180,"./jsonEditor":182,"codemirror":7,"lodash":12,"marked":13}],182:[function(require,module,exports){
'use strict';

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

},{"codemirror":7}]},{},[183])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS91YnVudHUvc3RhZ2luZy9jb2RlLXN0dWRpby9zcmMvanMvbGV2ZWxidWlsZGVyLmpzIiwiL2hvbWUvdWJ1bnR1L3N0YWdpbmcvY29kZS1zdHVkaW8vc3JjL2pzL2pzb25FZGl0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUNHQSxZQUFZLENBQUM7QUFDYixJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTFCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7QUFDaEQsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFO0FBQzVCLHNCQUFvQixFQUFFLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQztBQUN2RCxZQUFVLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQztDQUNwQyxDQUFDLENBQUM7OztBQUdILE1BQU0sQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUUxQyxNQUFNLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7O0FDZmxDLFlBQVksQ0FBQzs7QUFFYixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJ2QyxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsU0FBUyxFQUFFLE9BQU8sRUFBRTtBQUM3QyxXQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUV6QixNQUFJLFVBQVUsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNyRixRQUFJLEVBQUUsWUFB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QVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxhQUFhLEVBQUUsWUFBWTtBQUN2RCxLQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUM5QyxjQUFVLEVBQUUsQ0FBQztHQUNkLENBQUMsQ0FBQzs7QUFFSCxXQUFTLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLFlBQVk7QUFDbEQsY0FBVSxFQUFFLENBQUM7R0FDZCxDQUFDLENBQUM7Q0FDSixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGZpbGUgTWFpbiBlbnRyeSBwb2ludCBmb3Igc2NyaXB0cyB1c2VkIG9uIGFsbCBsZXZlbCBlZGl0aW5nIHBhZ2VzLlxuICovXG4ndXNlIHN0cmljdCc7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG53aW5kb3cubGV2ZWxidWlsZGVyID0gd2luZG93LmxldmVsYnVpbGRlciB8fCB7fTtcbl8uZXh0ZW5kKHdpbmRvdy5sZXZlbGJ1aWxkZXIsIHtcbiAgaW5pdGlhbGl6ZUNvZGVNaXJyb3I6IHJlcXVpcmUoJy4vaW5pdGlhbGl6ZUNvZGVNaXJyb3InKSxcbiAganNvbkVkaXRvcjogcmVxdWlyZSgnLi9qc29uRWRpdG9yJylcbn0pO1xuXG4vLyBUT0RPOiBSZW1vdmUgd2hlbiBnbG9iYWwgYENvZGVNaXJyb3JgIGlzIG5vIGxvbmdlciByZXF1aXJlZC5cbndpbmRvdy5Db2RlTWlycm9yID0gcmVxdWlyZSgnY29kZW1pcnJvcicpO1xuLy8gVE9ETzogUmVtb3ZlIHdoZW4gZ2xvYmFsIGBtYXJrZWRgIGlzIG5vIGxvbmdlciByZXF1aXJlZC5cbndpbmRvdy5tYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvZGVNaXJyb3IgPSByZXF1aXJlKCdjb2RlbWlycm9yJyk7XG5cbi8qKlxuICogXCJGYWN0b3J5XCIgZnVuY3Rpb24gdG8gdHJhbnNmb3JtIGEgY29udGFpbmVyIGludG8gYW4gaW50ZXJmYWNlIGZvclxuICogZWRpdGluZyBsaXN0cyBvZiBKU09OIHZhbHVlcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGFpbmVyIC0galF1ZXJ5IHNlbGVjdG9yIGZvciB0aGUgY29udGFpbmVyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuanNvbl90ZXh0YXJlYVxuICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuYWRkX2J1dHRvblxuICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMucmVtb3ZlX2J1dHRvblxuICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudmFsdWVfc3BhY2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnRlbXBsYXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5mb3JtX2NvbnRhaW5lclxuICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMud3JhcHBlclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMubW9kZWxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gIGNvbnRhaW5lciA9ICQoY29udGFpbmVyKTtcblxuICB2YXIganNvbkVkaXRvciA9IENvZGVNaXJyb3IuZnJvbVRleHRBcmVhKGNvbnRhaW5lci5maW5kKG9wdGlvbnMuanNvbl90ZXh0YXJlYSkuZ2V0KDApLCB7XG4gICAgbW9kZTogJ2phdmFzY3JpcHQnLFxuICAgIHZpZXdwb3J0TWFyZ2luOiBJbmZpbml0eSxcbiAgICBtYXRjaEJyYWNrZXRzOiB0cnVlXG4gIH0pO1xuXG4gIC8vIENyZWF0ZSBzcGFjZXMgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgb3JpZ2luYWwgSlNPTlxuICB2YXIganNvbkNvbnRlbnQgPSBqc29uRWRpdG9yLmdldFZhbHVlKCk7XG4gIGlmIChqc29uQ29udGVudC5sZW5ndGggPiAwKSB7XG4gICAgdmFyIHZhbHVlc1RvVXBkYXRlID0gSlNPTi5wYXJzZShqc29uRWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICQuZWFjaCh2YWx1ZXNUb1VwZGF0ZSwgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xuICAgICAgdXBkYXRlVGVtcGxhdGUodmFsdWUsICRjcmVhdGVOZXdTcGFjZSgpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgICogRm9yIGVhY2gga2V5IGluIHRoZSBnaXZlbiBtb2RlbCwgc2V0IHRoZSA8aW5wdXQ+IHdpdGggYSBtYXRjaGluZyBjbGFzcyBuYW1lIHRvIHRoZSBrZXkncyB2YWx1ZS5cbiAgICAqIEBwYXJhbSB7bW9kZWx9IFRoZSBtb2RlbCB0byB1c2Ugd2hlbiB1cGRhdGluZyB0aGUgRE9NLlxuICAgICogQHBhcmFtIHskdGVtcGxhdGV9IFRoZSBqUXVlcnkgZWxlbWVudCB0byBzZWFyY2ggZm9yIDxpbnB1dD4gZWxlbWVudHMuXG4gICAgKi9cbiAgZnVuY3Rpb24gdXBkYXRlVGVtcGxhdGUobW9kZWwsICR0ZW1wbGF0ZSkge1xuICAgICQuZWFjaChtb2RlbCwgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHVwZGF0ZVRlbXBsYXRlKHZhbHVlLCAkdGVtcGxhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHRlbXBsYXRlLmZpbmQoJy4nICsga2V5KS52YWwobW9kZWxba2V5XSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKG9wdGlvbnMub25OZXdTcGFjZSkge1xuICAgICAgb3B0aW9ucy5vbk5ld1NwYWNlKCR0ZW1wbGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAgKiBGb3IgZWFjaCBrZXkgaW4gdGhlIGdpdmVuIG1vZGVsLCBzZXQgdGhlIGtleSdzIHZhbHVlIHRvIHRoZSB2YWx1ZSBvZiB0aGUgPGlucHV0PiB3aXRoIGEgbWF0Y2hpbmcgY2xhc3MgbmFtZS5cbiAgICAqIEBwYXJhbSB7bW9kZWx9IFRoZSBtb2RlbCB0byB1cGRhdGUgZnJvbSB0aGUgRE9NLlxuICAgICogQHBhcmFtIHskdGVtcGxhdGV9IFRoZSBqUXVlcnkgZWxlbWVudCB0byBzZWFyY2ggZm9yIDxpbnB1dD4gZWxlbWVudHMuXG4gICAgKi9cbiAgZnVuY3Rpb24gdXBkYXRlTW9kZWwobW9kZWwsICR0ZW1wbGF0ZSkge1xuICAgICQuZWFjaChtb2RlbCwgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHVwZGF0ZU1vZGVsKHZhbHVlLCAkdGVtcGxhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSAkdGVtcGxhdGUuZmluZCgnLicgKyBrZXkpLnZhbCgpO1xuICAgICAgICBtb2RlbFtrZXldID0gdHlwZW9mIG1vZGVsW2tleV0gPT09ICdudW1iZXInID8gK3ZhbHVlIDogdmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVKU09OKCkge1xuICAgIHZhciB1cGRhdGVkVmFsdWVzID0gW107XG4gICAgY29udGFpbmVyLmZpbmQob3B0aW9ucy5mb3JtX2NvbnRhaW5lcikuZmluZChvcHRpb25zLnZhbHVlX3NwYWNlKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBtb2RlbCA9ICQuZXh0ZW5kKHRydWUsIHt9LCBvcHRpb25zLm1vZGVsKTtcbiAgICAgIHVwZGF0ZU1vZGVsKG1vZGVsLCAkKHRoaXMpKTtcbiAgICAgIHVwZGF0ZWRWYWx1ZXMucHVzaChtb2RlbCk7XG4gICAgfSk7XG4gICAganNvbkVkaXRvci5zZXRWYWx1ZShKU09OLnN0cmluZ2lmeSh1cGRhdGVkVmFsdWVzLCBudWxsLCAnICcpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uICRjcmVhdGVOZXdTcGFjZSgpIHtcbiAgICB2YXIgJG5ld1ZhbHVlID0gY29udGFpbmVyLmZpbmQob3B0aW9ucy50ZW1wbGF0ZSkuY2hpbGRyZW4oXCI6Zmlyc3RcIikuY2xvbmUoKTtcbiAgICBjb250YWluZXIuZmluZChvcHRpb25zLmZvcm1fY29udGFpbmVyKS5hcHBlbmQoJG5ld1ZhbHVlKTtcbiAgICByZXR1cm4gJG5ld1ZhbHVlO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMudXBfYnV0dG9uKSB7XG4gICAgY29udGFpbmVyLm9uKFwiY2xpY2tcIiwgb3B0aW9ucy51cF9idXR0b24sIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB3cmFwcGVyID0gJCh0aGlzKS5jbG9zZXN0KG9wdGlvbnMudmFsdWVfc3BhY2UpO1xuICAgICAgaWYgKHdyYXBwZXIucHJldigpLmxlbmd0aCkge1xuICAgICAgICB3cmFwcGVyLmluc2VydEJlZm9yZSh3cmFwcGVyLnByZXYoKSk7XG4gICAgICAgIHVwZGF0ZUpTT04oKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmRvd25fYnV0dG9uKSB7XG4gICAgY29udGFpbmVyLm9uKFwiY2xpY2tcIiwgb3B0aW9ucy5kb3duX2J1dHRvbiwgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHdyYXBwZXIgPSAkKHRoaXMpLmNsb3Nlc3Qob3B0aW9ucy52YWx1ZV9zcGFjZSk7XG4gICAgICBpZiAod3JhcHBlci5uZXh0KCkubGVuZ3RoKSB7XG4gICAgICAgIHdyYXBwZXIuaW5zZXJ0QWZ0ZXIod3JhcHBlci5uZXh0KCkpO1xuICAgICAgICB1cGRhdGVKU09OKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb250YWluZXIub24oXCJjbGlja1wiLCBvcHRpb25zLmFkZF9idXR0b24sIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbW9kZWwgPSAkLmV4dGVuZCh0cnVlLCB7fSwgb3B0aW9ucy5tb2RlbCk7XG4gICAgdXBkYXRlVGVtcGxhdGUobW9kZWwsICRjcmVhdGVOZXdTcGFjZSgpKTtcbiAgICB1cGRhdGVKU09OKCk7XG4gIH0pO1xuXG4gIGNvbnRhaW5lci5vbihcImNsaWNrXCIsIG9wdGlvbnMucmVtb3ZlX2J1dHRvbiwgZnVuY3Rpb24gKCkge1xuICAgICQodGhpcykuY2xvc2VzdChvcHRpb25zLnZhbHVlX3NwYWNlKS5yZW1vdmUoKTtcbiAgICB1cGRhdGVKU09OKCk7XG4gIH0pO1xuXG4gIGNvbnRhaW5lci5vbihcImNoYW5nZVwiLCBvcHRpb25zLndyYXBwZXIsIGZ1bmN0aW9uICgpIHtcbiAgICB1cGRhdGVKU09OKCk7XG4gIH0pO1xufTtcbiJdfQ==

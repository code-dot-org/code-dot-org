require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({16:[function(require,module,exports){
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

},{"./initializeCodeMirror":13,"./jsonEditor":15,"codemirror":6,"lodash":11,"marked":12}],15:[function(require,module,exports){
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

},{"codemirror":6}]},{},[16])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbGV2ZWxidWlsZGVyLmpzIiwic3JjL2pzL2pzb25FZGl0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBAZmlsZSBNYWluIGVudHJ5IHBvaW50IGZvciBzY3JpcHRzIHVzZWQgb24gYWxsIGxldmVsIGVkaXRpbmcgcGFnZXMuXG4gKi9cbid1c2Ugc3RyaWN0JztcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbndpbmRvdy5sZXZlbGJ1aWxkZXIgPSB3aW5kb3cubGV2ZWxidWlsZGVyIHx8IHt9O1xuXy5leHRlbmQod2luZG93LmxldmVsYnVpbGRlciwge1xuICBpbml0aWFsaXplQ29kZU1pcnJvcjogcmVxdWlyZSgnLi9pbml0aWFsaXplQ29kZU1pcnJvcicpLFxuICBqc29uRWRpdG9yOiByZXF1aXJlKCcuL2pzb25FZGl0b3InKVxufSk7XG5cbi8vIFRPRE86IFJlbW92ZSB3aGVuIGdsb2JhbCBgQ29kZU1pcnJvcmAgaXMgbm8gbG9uZ2VyIHJlcXVpcmVkLlxud2luZG93LkNvZGVNaXJyb3IgPSByZXF1aXJlKCdjb2RlbWlycm9yJyk7XG4vLyBUT0RPOiBSZW1vdmUgd2hlbiBnbG9iYWwgYG1hcmtlZGAgaXMgbm8gbG9uZ2VyIHJlcXVpcmVkLlxud2luZG93Lm1hcmtlZCA9IHJlcXVpcmUoJ21hcmtlZCcpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29kZU1pcnJvciA9IHJlcXVpcmUoJ2NvZGVtaXJyb3InKTtcblxuLyoqXG4gKiBcIkZhY3RvcnlcIiBmdW5jdGlvbiB0byB0cmFuc2Zvcm0gYSBjb250YWluZXIgaW50byBhbiBpbnRlcmZhY2UgZm9yXG4gKiBlZGl0aW5nIGxpc3RzIG9mIEpTT04gdmFsdWVzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250YWluZXIgLSBqUXVlcnkgc2VsZWN0b3IgZm9yIHRoZSBjb250YWluZXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5qc29uX3RleHRhcmVhXG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5hZGRfYnV0dG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5yZW1vdmVfYnV0dG9uXG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy52YWx1ZV9zcGFjZVxuICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGVtcGxhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmZvcm1fY29udGFpbmVyXG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy53cmFwcGVyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5tb2RlbFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgY29udGFpbmVyID0gJChjb250YWluZXIpO1xuXG4gIHZhciBqc29uRWRpdG9yID0gQ29kZU1pcnJvci5mcm9tVGV4dEFyZWEoY29udGFpbmVyLmZpbmQob3B0aW9ucy5qc29uX3RleHRhcmVhKS5nZXQoMCksIHtcbiAgICBtb2RlOiAnamF2YXNjcmlwdCcsXG4gICAgdmlld3BvcnRNYXJnaW46IEluZmluaXR5LFxuICAgIG1hdGNoQnJhY2tldHM6IHRydWVcbiAgfSk7XG5cbiAgLy8gQ3JlYXRlIHNwYWNlcyBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBvcmlnaW5hbCBKU09OXG4gIHZhciBqc29uQ29udGVudCA9IGpzb25FZGl0b3IuZ2V0VmFsdWUoKTtcbiAgaWYgKGpzb25Db250ZW50Lmxlbmd0aCA+IDApIHtcbiAgICB2YXIgdmFsdWVzVG9VcGRhdGUgPSBKU09OLnBhcnNlKGpzb25FZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgJC5lYWNoKHZhbHVlc1RvVXBkYXRlLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XG4gICAgICB1cGRhdGVUZW1wbGF0ZSh2YWx1ZSwgJGNyZWF0ZU5ld1NwYWNlKCkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAgKiBGb3IgZWFjaCBrZXkgaW4gdGhlIGdpdmVuIG1vZGVsLCBzZXQgdGhlIDxpbnB1dD4gd2l0aCBhIG1hdGNoaW5nIGNsYXNzIG5hbWUgdG8gdGhlIGtleSdzIHZhbHVlLlxuICAgICogQHBhcmFtIHttb2RlbH0gVGhlIG1vZGVsIHRvIHVzZSB3aGVuIHVwZGF0aW5nIHRoZSBET00uXG4gICAgKiBAcGFyYW0geyR0ZW1wbGF0ZX0gVGhlIGpRdWVyeSBlbGVtZW50IHRvIHNlYXJjaCBmb3IgPGlucHV0PiBlbGVtZW50cy5cbiAgICAqL1xuICBmdW5jdGlvbiB1cGRhdGVUZW1wbGF0ZShtb2RlbCwgJHRlbXBsYXRlKSB7XG4gICAgJC5lYWNoKG1vZGVsLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdXBkYXRlVGVtcGxhdGUodmFsdWUsICR0ZW1wbGF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkdGVtcGxhdGUuZmluZCgnLicgKyBrZXkpLnZhbChtb2RlbFtrZXldKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAob3B0aW9ucy5vbk5ld1NwYWNlKSB7XG4gICAgICBvcHRpb25zLm9uTmV3U3BhY2UoJHRlbXBsYXRlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICAqIEZvciBlYWNoIGtleSBpbiB0aGUgZ2l2ZW4gbW9kZWwsIHNldCB0aGUga2V5J3MgdmFsdWUgdG8gdGhlIHZhbHVlIG9mIHRoZSA8aW5wdXQ+IHdpdGggYSBtYXRjaGluZyBjbGFzcyBuYW1lLlxuICAgICogQHBhcmFtIHttb2RlbH0gVGhlIG1vZGVsIHRvIHVwZGF0ZSBmcm9tIHRoZSBET00uXG4gICAgKiBAcGFyYW0geyR0ZW1wbGF0ZX0gVGhlIGpRdWVyeSBlbGVtZW50IHRvIHNlYXJjaCBmb3IgPGlucHV0PiBlbGVtZW50cy5cbiAgICAqL1xuICBmdW5jdGlvbiB1cGRhdGVNb2RlbChtb2RlbCwgJHRlbXBsYXRlKSB7XG4gICAgJC5lYWNoKG1vZGVsLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdXBkYXRlTW9kZWwodmFsdWUsICR0ZW1wbGF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9ICR0ZW1wbGF0ZS5maW5kKCcuJyArIGtleSkudmFsKCk7XG4gICAgICAgIG1vZGVsW2tleV0gPSB0eXBlb2YgbW9kZWxba2V5XSA9PT0gJ251bWJlcicgPyArdmFsdWUgOiB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUpTT04oKSB7XG4gICAgdmFyIHVwZGF0ZWRWYWx1ZXMgPSBbXTtcbiAgICBjb250YWluZXIuZmluZChvcHRpb25zLmZvcm1fY29udGFpbmVyKS5maW5kKG9wdGlvbnMudmFsdWVfc3BhY2UpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG1vZGVsID0gJC5leHRlbmQodHJ1ZSwge30sIG9wdGlvbnMubW9kZWwpO1xuICAgICAgdXBkYXRlTW9kZWwobW9kZWwsICQodGhpcykpO1xuICAgICAgdXBkYXRlZFZhbHVlcy5wdXNoKG1vZGVsKTtcbiAgICB9KTtcbiAgICBqc29uRWRpdG9yLnNldFZhbHVlKEpTT04uc3RyaW5naWZ5KHVwZGF0ZWRWYWx1ZXMsIG51bGwsICcgJykpO1xuICB9XG5cbiAgZnVuY3Rpb24gJGNyZWF0ZU5ld1NwYWNlKCkge1xuICAgIHZhciAkbmV3VmFsdWUgPSBjb250YWluZXIuZmluZChvcHRpb25zLnRlbXBsYXRlKS5jaGlsZHJlbihcIjpmaXJzdFwiKS5jbG9uZSgpO1xuICAgIGNvbnRhaW5lci5maW5kKG9wdGlvbnMuZm9ybV9jb250YWluZXIpLmFwcGVuZCgkbmV3VmFsdWUpO1xuICAgIHJldHVybiAkbmV3VmFsdWU7XG4gIH1cblxuICBpZiAob3B0aW9ucy51cF9idXR0b24pIHtcbiAgICBjb250YWluZXIub24oXCJjbGlja1wiLCBvcHRpb25zLnVwX2J1dHRvbiwgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHdyYXBwZXIgPSAkKHRoaXMpLmNsb3Nlc3Qob3B0aW9ucy52YWx1ZV9zcGFjZSk7XG4gICAgICBpZiAod3JhcHBlci5wcmV2KCkubGVuZ3RoKSB7XG4gICAgICAgIHdyYXBwZXIuaW5zZXJ0QmVmb3JlKHdyYXBwZXIucHJldigpKTtcbiAgICAgICAgdXBkYXRlSlNPTigpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuZG93bl9idXR0b24pIHtcbiAgICBjb250YWluZXIub24oXCJjbGlja1wiLCBvcHRpb25zLmRvd25fYnV0dG9uLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgd3JhcHBlciA9ICQodGhpcykuY2xvc2VzdChvcHRpb25zLnZhbHVlX3NwYWNlKTtcbiAgICAgIGlmICh3cmFwcGVyLm5leHQoKS5sZW5ndGgpIHtcbiAgICAgICAgd3JhcHBlci5pbnNlcnRBZnRlcih3cmFwcGVyLm5leHQoKSk7XG4gICAgICAgIHVwZGF0ZUpTT04oKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbnRhaW5lci5vbihcImNsaWNrXCIsIG9wdGlvbnMuYWRkX2J1dHRvbiwgZnVuY3Rpb24gKCkge1xuICAgIHZhciBtb2RlbCA9ICQuZXh0ZW5kKHRydWUsIHt9LCBvcHRpb25zLm1vZGVsKTtcbiAgICB1cGRhdGVUZW1wbGF0ZShtb2RlbCwgJGNyZWF0ZU5ld1NwYWNlKCkpO1xuICAgIHVwZGF0ZUpTT04oKTtcbiAgfSk7XG5cbiAgY29udGFpbmVyLm9uKFwiY2xpY2tcIiwgb3B0aW9ucy5yZW1vdmVfYnV0dG9uLCBmdW5jdGlvbiAoKSB7XG4gICAgJCh0aGlzKS5jbG9zZXN0KG9wdGlvbnMudmFsdWVfc3BhY2UpLnJlbW92ZSgpO1xuICAgIHVwZGF0ZUpTT04oKTtcbiAgfSk7XG5cbiAgY29udGFpbmVyLm9uKFwiY2hhbmdlXCIsIG9wdGlvbnMud3JhcHBlciwgZnVuY3Rpb24gKCkge1xuICAgIHVwZGF0ZUpTT04oKTtcbiAgfSk7XG59O1xuIl19

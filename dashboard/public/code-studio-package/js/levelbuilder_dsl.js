require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({16:[function(require,module,exports){
/**
 * @file Main entry point for scripts used only in levelbuilder when editing
 *       DSL-defined levels.
 */
/* global $ */
'use strict';
var initializeEmbeddedMarkdownEditor = require('./initializeEmbeddedMarkdownEditor');

// Initialize markdown editors on page load
$(document).ready(function () {
  initializeEmbeddedMarkdownEditor(
    $('#level_dsl_text'),
    'markdown_textarea',
    $('#markdown-preview'),
    'markdown');
  initializeEmbeddedMarkdownEditor(
    $('#level_dsl_text'),
    'teacher_markdown_textarea',
    $('#teacher-markdown-preview'),
    'teacher_markdown');
});

},{"./initializeEmbeddedMarkdownEditor":14}],14:[function(require,module,exports){
/**
 * @file Defines a function for initializing an embedded markdown editor using
 *       CodeMirror and marked.
 */
'use strict';
var marked = require("marked");
var initializeCodeMirror = require("./initializeCodeMirror");

/**
 * Initializes a live preview markdown editor that spits its contents out into
 * a given text area as embedded markdown of the form:
 *
 *    markdown <<MARKDOWN
 *    My markdown here
 *    MARKDOWN
 *
 * Suitable for setting a DSL's markdown element
 *
 * @param {jQuery} embeddedElement textarea element within which to embed the markdown
 * @param {string} markdownTextArea id (which will be prefixed by "level_")
 *                                  of textarea where editor will live
 * @param {jQuery} markdownPreviewArea
 * @param {string} name of the property within the textarea
 */
module.exports = function (embeddedElement, markdownTextArea, markdownPreviewArea, markdownProperty) {
  var regex = new RegExp("^" + markdownProperty + " <<(\\w*)\\n([\\s\\S]*?)\\n\\1\\s*$", "m");
  var dslElement = embeddedElement;
  var dslText = dslElement.val();

  var mdEditor = initializeCodeMirror(markdownTextArea, 'markdown', function (editor, change) {
    markdownPreviewArea.html(marked(editor.getValue()));
    markdownPreviewArea.children('details').details();

    var editorText = editor.getValue();
    var dslText = dslElement.val();
    var replacedText;
    if (regex.exec(dslText)) {
      replacedText = dslText.replace(regex, markdownProperty + ' <<$1\n' + editorText + '\n$1\n');
    } else {
      replacedText = dslText + '\n' + markdownProperty + ' <<MARKDOWN\n' + editorText + '\nMARKDOWN\n';
    }
    dslElement.val(replacedText);
  }, true);

  // Match against markdown heredoc syntax and capture contents in [2].
  var match = regex.exec(dslText);
  if (match && match[2]) {
    var markdownText = match[2];
    mdEditor.setValue(markdownText);
  } else {
    mdEditor.setValue('');
  }
};

},{"./initializeCodeMirror":13,"marked":12}]},{},[16])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbGV2ZWxidWlsZGVyX2RzbC5qcyIsInNyYy9qcy9pbml0aWFsaXplRW1iZWRkZWRNYXJrZG93bkVkaXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBAZmlsZSBNYWluIGVudHJ5IHBvaW50IGZvciBzY3JpcHRzIHVzZWQgb25seSBpbiBsZXZlbGJ1aWxkZXIgd2hlbiBlZGl0aW5nXG4gKiAgICAgICBEU0wtZGVmaW5lZCBsZXZlbHMuXG4gKi9cbi8qIGdsb2JhbCAkICovXG4ndXNlIHN0cmljdCc7XG52YXIgaW5pdGlhbGl6ZUVtYmVkZGVkTWFya2Rvd25FZGl0b3IgPSByZXF1aXJlKCcuL2luaXRpYWxpemVFbWJlZGRlZE1hcmtkb3duRWRpdG9yJyk7XG5cbi8vIEluaXRpYWxpemUgbWFya2Rvd24gZWRpdG9ycyBvbiBwYWdlIGxvYWRcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgaW5pdGlhbGl6ZUVtYmVkZGVkTWFya2Rvd25FZGl0b3IoXG4gICAgJCgnI2xldmVsX2RzbF90ZXh0JyksXG4gICAgJ21hcmtkb3duX3RleHRhcmVhJyxcbiAgICAkKCcjbWFya2Rvd24tcHJldmlldycpLFxuICAgICdtYXJrZG93bicpO1xuICBpbml0aWFsaXplRW1iZWRkZWRNYXJrZG93bkVkaXRvcihcbiAgICAkKCcjbGV2ZWxfZHNsX3RleHQnKSxcbiAgICAndGVhY2hlcl9tYXJrZG93bl90ZXh0YXJlYScsXG4gICAgJCgnI3RlYWNoZXItbWFya2Rvd24tcHJldmlldycpLFxuICAgICd0ZWFjaGVyX21hcmtkb3duJyk7XG59KTtcbiIsIi8qKlxuICogQGZpbGUgRGVmaW5lcyBhIGZ1bmN0aW9uIGZvciBpbml0aWFsaXppbmcgYW4gZW1iZWRkZWQgbWFya2Rvd24gZWRpdG9yIHVzaW5nXG4gKiAgICAgICBDb2RlTWlycm9yIGFuZCBtYXJrZWQuXG4gKi9cbid1c2Ugc3RyaWN0JztcbnZhciBtYXJrZWQgPSByZXF1aXJlKFwibWFya2VkXCIpO1xudmFyIGluaXRpYWxpemVDb2RlTWlycm9yID0gcmVxdWlyZShcIi4vaW5pdGlhbGl6ZUNvZGVNaXJyb3JcIik7XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgYSBsaXZlIHByZXZpZXcgbWFya2Rvd24gZWRpdG9yIHRoYXQgc3BpdHMgaXRzIGNvbnRlbnRzIG91dCBpbnRvXG4gKiBhIGdpdmVuIHRleHQgYXJlYSBhcyBlbWJlZGRlZCBtYXJrZG93biBvZiB0aGUgZm9ybTpcbiAqXG4gKiAgICBtYXJrZG93biA8PE1BUktET1dOXG4gKiAgICBNeSBtYXJrZG93biBoZXJlXG4gKiAgICBNQVJLRE9XTlxuICpcbiAqIFN1aXRhYmxlIGZvciBzZXR0aW5nIGEgRFNMJ3MgbWFya2Rvd24gZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7alF1ZXJ5fSBlbWJlZGRlZEVsZW1lbnQgdGV4dGFyZWEgZWxlbWVudCB3aXRoaW4gd2hpY2ggdG8gZW1iZWQgdGhlIG1hcmtkb3duXG4gKiBAcGFyYW0ge3N0cmluZ30gbWFya2Rvd25UZXh0QXJlYSBpZCAod2hpY2ggd2lsbCBiZSBwcmVmaXhlZCBieSBcImxldmVsX1wiKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2YgdGV4dGFyZWEgd2hlcmUgZWRpdG9yIHdpbGwgbGl2ZVxuICogQHBhcmFtIHtqUXVlcnl9IG1hcmtkb3duUHJldmlld0FyZWFcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB3aXRoaW4gdGhlIHRleHRhcmVhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVtYmVkZGVkRWxlbWVudCwgbWFya2Rvd25UZXh0QXJlYSwgbWFya2Rvd25QcmV2aWV3QXJlYSwgbWFya2Rvd25Qcm9wZXJ0eSkge1xuICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKFwiXlwiICsgbWFya2Rvd25Qcm9wZXJ0eSArIFwiIDw8KFxcXFx3KilcXFxcbihbXFxcXHNcXFxcU10qPylcXFxcblxcXFwxXFxcXHMqJFwiLCBcIm1cIik7XG4gIHZhciBkc2xFbGVtZW50ID0gZW1iZWRkZWRFbGVtZW50O1xuICB2YXIgZHNsVGV4dCA9IGRzbEVsZW1lbnQudmFsKCk7XG5cbiAgdmFyIG1kRWRpdG9yID0gaW5pdGlhbGl6ZUNvZGVNaXJyb3IobWFya2Rvd25UZXh0QXJlYSwgJ21hcmtkb3duJywgZnVuY3Rpb24gKGVkaXRvciwgY2hhbmdlKSB7XG4gICAgbWFya2Rvd25QcmV2aWV3QXJlYS5odG1sKG1hcmtlZChlZGl0b3IuZ2V0VmFsdWUoKSkpO1xuICAgIG1hcmtkb3duUHJldmlld0FyZWEuY2hpbGRyZW4oJ2RldGFpbHMnKS5kZXRhaWxzKCk7XG5cbiAgICB2YXIgZWRpdG9yVGV4dCA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgIHZhciBkc2xUZXh0ID0gZHNsRWxlbWVudC52YWwoKTtcbiAgICB2YXIgcmVwbGFjZWRUZXh0O1xuICAgIGlmIChyZWdleC5leGVjKGRzbFRleHQpKSB7XG4gICAgICByZXBsYWNlZFRleHQgPSBkc2xUZXh0LnJlcGxhY2UocmVnZXgsIG1hcmtkb3duUHJvcGVydHkgKyAnIDw8JDFcXG4nICsgZWRpdG9yVGV4dCArICdcXG4kMVxcbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXBsYWNlZFRleHQgPSBkc2xUZXh0ICsgJ1xcbicgKyBtYXJrZG93blByb3BlcnR5ICsgJyA8PE1BUktET1dOXFxuJyArIGVkaXRvclRleHQgKyAnXFxuTUFSS0RPV05cXG4nO1xuICAgIH1cbiAgICBkc2xFbGVtZW50LnZhbChyZXBsYWNlZFRleHQpO1xuICB9LCB0cnVlKTtcblxuICAvLyBNYXRjaCBhZ2FpbnN0IG1hcmtkb3duIGhlcmVkb2Mgc3ludGF4IGFuZCBjYXB0dXJlIGNvbnRlbnRzIGluIFsyXS5cbiAgdmFyIG1hdGNoID0gcmVnZXguZXhlYyhkc2xUZXh0KTtcbiAgaWYgKG1hdGNoICYmIG1hdGNoWzJdKSB7XG4gICAgdmFyIG1hcmtkb3duVGV4dCA9IG1hdGNoWzJdO1xuICAgIG1kRWRpdG9yLnNldFZhbHVlKG1hcmtkb3duVGV4dCk7XG4gIH0gZWxzZSB7XG4gICAgbWRFZGl0b3Iuc2V0VmFsdWUoJycpO1xuICB9XG59O1xuIl19

require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({184:[function(require,module,exports){
/**
 * @file Main entry point for scripts used only in levelbuilder when editing
 *       DSL-defined levels.
 */
/* global $ */
'use strict';
var initializeEmbeddedMarkdownEditor = require('./initializeEmbeddedMarkdownEditor');

// Initialize markdown editors on page load
$(document).ready(function () {
  initializeEmbeddedMarkdownEditor($('#level_dsl_text'), 'markdown_textarea', $('#markdown-preview'), 'markdown');
  initializeEmbeddedMarkdownEditor($('#level_dsl_text'), 'teacher_markdown_textarea', $('#teacher-markdown-preview'), 'teacher_markdown');
});

},{"./initializeEmbeddedMarkdownEditor":181}],181:[function(require,module,exports){
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

},{"./initializeCodeMirror":180,"marked":13}]},{},[184])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS91YnVudHUvc3RhZ2luZy9jb2RlLXN0dWRpby9zcmMvanMvbGV2ZWxidWlsZGVyX2RzbC5qcyIsIi9ob21lL3VidW50dS9zdGFnaW5nL2NvZGUtc3R1ZGlvL3NyYy9qcy9pbml0aWFsaXplRW1iZWRkZWRNYXJrZG93bkVkaXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDS0EsWUFBWSxDQUFDO0FBQ2IsSUFBSSxnQ0FBZ0MsR0FBRyxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQzs7O0FBR3JGLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWTtBQUM1QixrQ0FBZ0MsQ0FDOUIsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLEVBQ3BCLG1CQUFtQixFQUNuQixDQUFDLENBQUMsbUJBQW1CLENBQUMsRUFDdEIsVUFBVSxDQUFDLENBQUM7QUFDZCxrQ0FBZ0MsQ0FDOUIsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLEVBQ3BCLDJCQUEyQixFQUMzQixDQUFDLENBQUMsMkJBQTJCLENBQUMsRUFDOUIsa0JBQWtCLENBQUMsQ0FBQztDQUN2QixDQUFDLENBQUM7Ozs7Ozs7QUNoQkgsWUFBWSxDQUFDO0FBQ2IsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLElBQUksb0JBQW9CLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCN0QsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSxnQkFBZ0IsRUFBRTtBQUNuRyxNQUFJLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEdBQUcsZ0JBQWdCLEdBQUcscUNBQXFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDNUYsTUFBSSxVQUFVLEdBQUcsZUFBZSxDQUFDO0FBQ2pDLE1BQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFL0IsTUFBSSxRQUFRLEdBQUcsb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLFVBQVUsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUMxRix1QkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDcEQsdUJBQW1CLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVsRCxRQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbkMsUUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQy9CLFFBQUksWUFBWSxDQUFDO0FBQ2pCLFFBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUN2QixrQkFBWSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGdCQUFnQixHQUFHLFNBQVMsR0FBRyxVQUFVLEdBQUcsUUFBUSxDQUFDLENBQUM7S0FDN0YsTUFBTTtBQUNMLGtCQUFZLEdBQUcsT0FBTyxHQUFHLElBQUksR0FBRyxnQkFBZ0IsR0FBRyxlQUFlLEdBQUcsVUFBVSxHQUFHLGNBQWMsQ0FBQztLQUNsRztBQUNELGNBQVUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7R0FDOUIsRUFBRSxJQUFJLENBQUMsQ0FBQzs7O0FBR1QsTUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNoQyxNQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDckIsUUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLFlBQVEsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7R0FDakMsTUFBTTtBQUNMLFlBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDdkI7Q0FDRixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGZpbGUgTWFpbiBlbnRyeSBwb2ludCBmb3Igc2NyaXB0cyB1c2VkIG9ubHkgaW4gbGV2ZWxidWlsZGVyIHdoZW4gZWRpdGluZ1xuICogICAgICAgRFNMLWRlZmluZWQgbGV2ZWxzLlxuICovXG4vKiBnbG9iYWwgJCAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIGluaXRpYWxpemVFbWJlZGRlZE1hcmtkb3duRWRpdG9yID0gcmVxdWlyZSgnLi9pbml0aWFsaXplRW1iZWRkZWRNYXJrZG93bkVkaXRvcicpO1xuXG4vLyBJbml0aWFsaXplIG1hcmtkb3duIGVkaXRvcnMgb24gcGFnZSBsb2FkXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gIGluaXRpYWxpemVFbWJlZGRlZE1hcmtkb3duRWRpdG9yKFxuICAgICQoJyNsZXZlbF9kc2xfdGV4dCcpLFxuICAgICdtYXJrZG93bl90ZXh0YXJlYScsXG4gICAgJCgnI21hcmtkb3duLXByZXZpZXcnKSxcbiAgICAnbWFya2Rvd24nKTtcbiAgaW5pdGlhbGl6ZUVtYmVkZGVkTWFya2Rvd25FZGl0b3IoXG4gICAgJCgnI2xldmVsX2RzbF90ZXh0JyksXG4gICAgJ3RlYWNoZXJfbWFya2Rvd25fdGV4dGFyZWEnLFxuICAgICQoJyN0ZWFjaGVyLW1hcmtkb3duLXByZXZpZXcnKSxcbiAgICAndGVhY2hlcl9tYXJrZG93bicpO1xufSk7XG4iLCIvKipcbiAqIEBmaWxlIERlZmluZXMgYSBmdW5jdGlvbiBmb3IgaW5pdGlhbGl6aW5nIGFuIGVtYmVkZGVkIG1hcmtkb3duIGVkaXRvciB1c2luZ1xuICogICAgICAgQ29kZU1pcnJvciBhbmQgbWFya2VkLlxuICovXG4ndXNlIHN0cmljdCc7XG52YXIgbWFya2VkID0gcmVxdWlyZShcIm1hcmtlZFwiKTtcbnZhciBpbml0aWFsaXplQ29kZU1pcnJvciA9IHJlcXVpcmUoXCIuL2luaXRpYWxpemVDb2RlTWlycm9yXCIpO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGEgbGl2ZSBwcmV2aWV3IG1hcmtkb3duIGVkaXRvciB0aGF0IHNwaXRzIGl0cyBjb250ZW50cyBvdXQgaW50b1xuICogYSBnaXZlbiB0ZXh0IGFyZWEgYXMgZW1iZWRkZWQgbWFya2Rvd24gb2YgdGhlIGZvcm06XG4gKlxuICogICAgbWFya2Rvd24gPDxNQVJLRE9XTlxuICogICAgTXkgbWFya2Rvd24gaGVyZVxuICogICAgTUFSS0RPV05cbiAqXG4gKiBTdWl0YWJsZSBmb3Igc2V0dGluZyBhIERTTCdzIG1hcmtkb3duIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge2pRdWVyeX0gZW1iZWRkZWRFbGVtZW50IHRleHRhcmVhIGVsZW1lbnQgd2l0aGluIHdoaWNoIHRvIGVtYmVkIHRoZSBtYXJrZG93blxuICogQHBhcmFtIHtzdHJpbmd9IG1hcmtkb3duVGV4dEFyZWEgaWQgKHdoaWNoIHdpbGwgYmUgcHJlZml4ZWQgYnkgXCJsZXZlbF9cIilcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mIHRleHRhcmVhIHdoZXJlIGVkaXRvciB3aWxsIGxpdmVcbiAqIEBwYXJhbSB7alF1ZXJ5fSBtYXJrZG93blByZXZpZXdBcmVhXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBvZiB0aGUgcHJvcGVydHkgd2l0aGluIHRoZSB0ZXh0YXJlYVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbWJlZGRlZEVsZW1lbnQsIG1hcmtkb3duVGV4dEFyZWEsIG1hcmtkb3duUHJldmlld0FyZWEsIG1hcmtkb3duUHJvcGVydHkpIHtcbiAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChcIl5cIiArIG1hcmtkb3duUHJvcGVydHkgKyBcIiA8PChcXFxcdyopXFxcXG4oW1xcXFxzXFxcXFNdKj8pXFxcXG5cXFxcMVxcXFxzKiRcIiwgXCJtXCIpO1xuICB2YXIgZHNsRWxlbWVudCA9IGVtYmVkZGVkRWxlbWVudDtcbiAgdmFyIGRzbFRleHQgPSBkc2xFbGVtZW50LnZhbCgpO1xuXG4gIHZhciBtZEVkaXRvciA9IGluaXRpYWxpemVDb2RlTWlycm9yKG1hcmtkb3duVGV4dEFyZWEsICdtYXJrZG93bicsIGZ1bmN0aW9uIChlZGl0b3IsIGNoYW5nZSkge1xuICAgIG1hcmtkb3duUHJldmlld0FyZWEuaHRtbChtYXJrZWQoZWRpdG9yLmdldFZhbHVlKCkpKTtcbiAgICBtYXJrZG93blByZXZpZXdBcmVhLmNoaWxkcmVuKCdkZXRhaWxzJykuZGV0YWlscygpO1xuXG4gICAgdmFyIGVkaXRvclRleHQgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICB2YXIgZHNsVGV4dCA9IGRzbEVsZW1lbnQudmFsKCk7XG4gICAgdmFyIHJlcGxhY2VkVGV4dDtcbiAgICBpZiAocmVnZXguZXhlYyhkc2xUZXh0KSkge1xuICAgICAgcmVwbGFjZWRUZXh0ID0gZHNsVGV4dC5yZXBsYWNlKHJlZ2V4LCBtYXJrZG93blByb3BlcnR5ICsgJyA8PCQxXFxuJyArIGVkaXRvclRleHQgKyAnXFxuJDFcXG4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVwbGFjZWRUZXh0ID0gZHNsVGV4dCArICdcXG4nICsgbWFya2Rvd25Qcm9wZXJ0eSArICcgPDxNQVJLRE9XTlxcbicgKyBlZGl0b3JUZXh0ICsgJ1xcbk1BUktET1dOXFxuJztcbiAgICB9XG4gICAgZHNsRWxlbWVudC52YWwocmVwbGFjZWRUZXh0KTtcbiAgfSwgdHJ1ZSk7XG5cbiAgLy8gTWF0Y2ggYWdhaW5zdCBtYXJrZG93biBoZXJlZG9jIHN5bnRheCBhbmQgY2FwdHVyZSBjb250ZW50cyBpbiBbMl0uXG4gIHZhciBtYXRjaCA9IHJlZ2V4LmV4ZWMoZHNsVGV4dCk7XG4gIGlmIChtYXRjaCAmJiBtYXRjaFsyXSkge1xuICAgIHZhciBtYXJrZG93blRleHQgPSBtYXRjaFsyXTtcbiAgICBtZEVkaXRvci5zZXRWYWx1ZShtYXJrZG93blRleHQpO1xuICB9IGVsc2Uge1xuICAgIG1kRWRpdG9yLnNldFZhbHVlKCcnKTtcbiAgfVxufTtcbiJdfQ==

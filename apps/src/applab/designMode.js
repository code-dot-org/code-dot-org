/* global Applab */
import $ from 'jquery';
import 'jquery-ui/ui/effects/effect-drop';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/droppable';
import 'jquery-ui/ui/widgets/resizable';
import React from 'react';
import ReactDOM from 'react-dom';
import DesignWorkspace from './DesignWorkspace';
import * as assetPrefix from '../assetManagement/assetPrefix';
import elementLibrary from './designElements/library';
import * as elementUtils from './designElements/elementUtils';
import {singleton as studioApp} from '../StudioApp';
import {KeyCodes} from '../constants';
import * as applabConstants from './constants';
import sanitizeHtml from './sanitizeHtml';
import * as utils from '../utils';
import * as gridUtils from './gridUtils';
import logToCloud from '../logToCloud';
import {actions} from './redux/applab';
import * as screens from './redux/screens';
import {getStore} from '../redux';
import {applabObjectFitImages} from './applabObjectFitImages';

var designMode = {};
export default designMode;

var ICON_PREFIX = applabConstants.ICON_PREFIX;
var ICON_PREFIX_REGEX = applabConstants.ICON_PREFIX_REGEX;

var currentlyEditedElement = null;
var clipboardElement = null;

var ApplabInterfaceMode = applabConstants.ApplabInterfaceMode;

var ANIMATION_LENGTH_MS = applabConstants.ANIMATION_LENGTH_MS;

/**
 * Subscribe to state changes on the store.
 * @param {!Store} store
 */
designMode.setupReduxSubscribers = function (store) {
  var state;
  store.subscribe(function () {
    var lastState = state;
    state = store.getState();

    if (!lastState ||
        state.screens.currentScreenId !== lastState.screens.currentScreenId) {
      renderScreens(state.screens.currentScreenId);
    }
  });
};

/**
 * If in design mode and program is not running, display Properties
 * pane for editing the clicked element.
 * @param event
 */
designMode.onDesignModeVizClick = function (event) {
  if (!Applab.isInDesignMode() ||
      $('#resetButton').is(':visible')) {
    return;
  }
  event.preventDefault();

  var element = event.target;
  if (element.id === 'designModeViz') {
    element = designMode.activeScreen();
  }

  if ($(element).is('.ui-resizable')) {
    element = getInnerElement(element);
  } else if ($(element).is('.ui-resizable-handle')) {
    element = getInnerElement(element.parentNode);
  } else if ($(element).attr('class') === undefined && $(element.parentNode).is('.textArea')) {
    // User may have clicked one of the divs of a multiline text area - in this case, the element is just a plain
    // div with no class, and we want to use the full text area element.
    element = getInnerElement(element.parentNode.parentNode);
  }
  // Give the div focus so that we can listen for keyboard events.
  $("#designModeViz").focus();
  designMode.editElementProperties(element);
};

/**
 * @returns {HTMLElement} The currently visible screen element.
 */
designMode.activeScreen = function () {
  return elementUtils.getScreens().filter(function () {
    return this.style.display !== 'none';
  }).first()[0];
};

/**
 * Create a new element of the specified type within the play space.
 * @param {ElementType} elementType Type of element to create
 * @param {number} left Position from left.
 * @param {number} top Position from top.
 * @returns {HTMLElement} The generated element
 */
designMode.createElement = function (elementType, left, top) {
  var element = elementLibrary.createElement(elementType, left, top);
  designMode.attachElement(element);
  return element;
};

designMode.attachElement = function (element) {
  var parent;
  var isScreen = $(element).hasClass('screen');
  if (isScreen) {
    parent = document.getElementById('designModeViz');
  } else {
    parent = designMode.activeScreen();
  }
  parent.appendChild(element);

  if (!isScreen) {
    makeDraggable($(element));
  }
  designMode.editElementProperties(element);
};

designMode.editElementProperties = function (element) {
  highlightElement(element);

  currentlyEditedElement = element;
  designMode.renderDesignWorkspace(element);
};

/**
 * Loads the current element or current screen into the property tab.
 * Also makes sure we re-render design mode to update properties such as isDimmed.
 */
designMode.resetPropertyTab = function () {
  var element = currentlyEditedElement || designMode.activeScreen();
  designMode.editElementProperties(element);
  Applab.render();
};

/**
 * Enable (or disable) dragging of new elements from the element tray
 * @param allowEditing {boolean}
 */
designMode.resetElementTray = function (allowEditing) {
  $('#design-toolbox .new-design-element').each(function () {
    $(this).draggable(allowEditing ? 'enable' : 'disable');
  });
};

/**
 * Given an input value produce a valid css value that is
 * either in pixels or empty.
 */
function appendPx(input) {
  // Don't append if we already have a px
  if (/px/.test(input)) {
    return input;
  }
  //if any sort of object, including arrays, is inputted, return empty string.
  //This gets around how parseInt and parseFloat treat arrays with first element numbers
  const parsedInput = parseInt(input);
  return (isNaN(parsedInput) || typeof input === 'object') ? '' : parsedInput + 'px';
}
designMode.appendPx = appendPx;

/**
 * Handle a change from our properties table.
 * @param element {Element}
 * @param name {string}
 * @param value {string}
 */
designMode.onPropertyChange = function (element, name, value) {
  designMode.updateProperty(element, name, value);
  designMode.editElementProperties(element);
};

/**
 * After handling properties generically, give elementLibrary a chance
 * to do any element specific changes.
 * @param element
 * @param name
 * @param value
 */
designMode.updateProperty = function (element, name, value) {
  // For labels, we need to remember before we change the value if the element was "fitted" around the text or if it was
  // resized by the user. If it was previously fitted, then we will keep it fitted in the typeSpecificPropertyChange
  // method at the end. If it is not a label, then the return value from getPreChangeData will be null and will be
  // ignored.
  var preChangeData = elementLibrary.getPreChangeData(element, name);
  var handled = true;
  switch (name) {
    case 'id':
      value = value.trim();
      elementUtils.setId(element, value);
      if (elementLibrary.getElementType(element) ===
          elementLibrary.ElementType.SCREEN) {
        // rerender design toggle, which has a dropdown of screen ids
        designMode.changeScreen(value);
      }
      break;
    case 'left':
      var newLeft = appendPx(value);
      element.style.left = newLeft;
      if (gridUtils.isDraggableContainer(element.parentNode)) {
        element.parentNode.style.left = newLeft;
      }
      break;
    case 'top':
      var newTop = appendPx(value);
      element.style.top = newTop;
      if (gridUtils.isDraggableContainer(element.parentNode)) {
        element.parentNode.style.top = newTop;
      }
      break;
    case 'width':
      element.setAttribute('width', appendPx(value));
      break;
    case 'height':
      element.setAttribute('height', appendPx(value));
      break;
    case 'style-width':
      var newWidth = appendPx(value);
      element.style.width = newWidth;
      if (gridUtils.isDraggableContainer(element.parentNode)) {
        element.parentNode.style.width = newWidth;
      }
      break;
    case 'style-height':
      var newHeight = appendPx(value);
      element.style.height = newHeight;
      if (gridUtils.isDraggableContainer(element.parentNode)) {
        element.parentNode.style.height = newHeight;
      }
      break;
    case 'text':
      // If element is a dropdown, do nothing here and use the type-specific setter
      if (element.nodeName !== 'SELECT') {
        element.innerHTML = utils.escapeText(value);
      }
      break;
    case 'textColor':
      element.style.color = value;
      break;
    case 'backgroundColor':
      element.style.backgroundColor = value;
      break;
    case 'fontSize':
      element.style.fontSize = appendPx(value);
      break;
    case 'textAlign':
      element.style.textAlign = value;
      break;
    case 'icon-color': {
      // This case is block-wrapped to allow scoped lexical declaration.
      // See http://eslint.org/docs/rules/no-case-declarations
      element.setAttribute('data-icon-color', value);
      const imageUrl = element.getAttribute('data-canonical-image-url');
      if (ICON_PREFIX_REGEX.test(imageUrl)) {
        const url = assetPrefix.renderIconToString(imageUrl, element);
        if (element.nodeName === "IMG") {
          element.src = url;
        } else {
          element.style.backgroundImage = 'url(' + url + ')';
        }
      }
      break;
    }
    // Set an image on a button.
    case 'image':
      var originalValue = element.getAttribute('data-canonical-image-url');
      element.setAttribute('data-canonical-image-url', value);

      var fitImage = function () {
        // Fit the image into the button
        element.style.backgroundSize = 'contain';
        element.style.backgroundPosition = '50% 50%';
        element.style.backgroundRepeat = 'no-repeat';

        // Re-render properties
        if (currentlyEditedElement === element) {
          designMode.editElementProperties(element);
        }
      };

      if (ICON_PREFIX_REGEX.test(value)) {
        element.style.backgroundImage = 'url(' + assetPrefix.renderIconToString(value, element) + ')';
        fitImage();
        break;
      }

      var backgroundImage = new Image();
      backgroundImage.src = assetPrefix.fixPath(value);
      element.style.backgroundImage = 'url("' + backgroundImage.src + '")';

      // do not resize if only the asset path has changed (e.g. on remix).
      if (value !== originalValue) {
        backgroundImage.onload = fitImage;
      }
      break;
    // Set an image on a screen.
    case 'screen-image': {
      element.setAttribute('data-canonical-image-url', value);

      // We stretch the image to fit the element
      var width = parseInt(element.style.width, 10);
      var height = parseInt(element.style.height, 10);
      element.style.backgroundSize = width + 'px ' + height + 'px';

      let url;
      if (ICON_PREFIX_REGEX.test(value)) {
        url = assetPrefix.renderIconToString(value, element);
      } else {
        const screenImage = new Image();
        screenImage.src = assetPrefix.fixPath(value);
        url = screenImage.src;
      }
      element.style.backgroundImage = 'url("' + url + '")';

      break;
    }
    // Set an image on an image element.
    case 'picture':
      originalValue = element.getAttribute('data-canonical-image-url');
      element.setAttribute('data-canonical-image-url', value);

      if (ICON_PREFIX_REGEX.test(value)) {
        element.src = assetPrefix.renderIconToString(value, element);
      } else {
        element.src = value === '' ? '/blockly/media/1x1.gif' : assetPrefix.fixPath(value);
      }
      break;
    case 'hidden':
      // Add a class that shows as 30% opacity in design mode, and invisible
      // in code mode.
      $(element).toggleClass('design-mode-hidden', value === true);
      break;
    case 'checked':
      // element.checked represents the current state, the attribute represents
      // the serialized state
      element.checked = value;

      if (value) {
        var groupName = element.getAttribute('name');
        if (groupName) {
          // Remove checked attribute from all other radio buttons in group
          var buttons = document.getElementsByName(groupName);
          Array.prototype.forEach.call(buttons, function (item) {
            if (item.type === 'radio') {
              item.removeAttribute('checked');
            }
          });
        }
        element.setAttribute('checked', 'checked');
      } else {
        element.removeAttribute('checked');
      }
      break;
    case 'options':
      // value should be an array of options in this case
      for (var i = 0; i < value.length; i++) {
        var optionElement = element.children[i];
        if (!optionElement) {
          optionElement = document.createElement('option');
          element.appendChild(optionElement);
        }
        optionElement.textContent = value[i];
      }
      // remove any extra options
      while (element.children[i]) {
        element.removeChild(element.children[i]);
      }
      break;
    case 'groupId':
      element.setAttribute('name', value);
      break;
    case 'placeholder':
      element.setAttribute('placeholder', value);
      break;
    case 'rows':
      element.setAttribute('rows', value);
      break;
    case 'cols':
      element.setAttribute('rows', value);
      break;
    case 'readonly':
      element.setAttribute('contenteditable', !value);
      break;
    case 'is-default':
      if (value === true) {
        // Make this one default
        $('#designModeViz').prepend(element);

        //Resort elements in the dropdown list
        var options = $('#screenSelector option');
        var newScreenText = applabConstants.NEW_SCREEN;
        var defaultScreenId = elementUtils.getId(element);
        options.sort(function (a, b) {
          if (a.text === defaultScreenId) {
            return -1;
          } else if (b.text === defaultScreenId) {
            return 1;
          } else if (a.text === newScreenText) {
            return 1;
          } else if (b.text === newScreenText) {
            return -1;
          } else {
            return a.text.localeCompare(b.text);
          }
        });

        $('#screenSelector').html(options);
        $('#screenSelector')[0].selectedIndex = 0;

      }
      break;
    default:
      // Mark as unhandled, but give typeSpecificPropertyChange a chance to
      // handle it
      handled = false;
  }

  // For labels, this is what snaps to fit. We need to not snap to fit if the element has previously been resized,
  // which we approximate by determining if it fit perfectly before the property change. Also needs to work on first
  // time creation.
  if (elementLibrary.typeSpecificPropertyChange(element, name, value, preChangeData)) {
    handled = true;
  }

  if (!handled) {
    throw "unknown property name " + name;
  }
};

/**
 * Reads property 'name' of html element 'element'.
 * @param {Element} element The html element to read the property from. The element could
 *   have been created in design mode or code mode.
 * @param {string} name The internal name of the property to read. This is not always
 *   the name of an html attribute or css style. Valid names are different for each
 *   element as defined in PROP_INFO in setPropertyDropdown.js.
 * @returns {*}
 */
designMode.readProperty = function (element, name) {
  switch (name) {
    case 'left':
      // Ignore 'px' suffix
      return parseFloat(element.style.left);
    case 'top':
      return parseFloat(element.style.top);
    case 'width':
      return parseFloat(element.getAttribute('width'));
    case 'height':
      return parseFloat(element.getAttribute('height'));
    case 'style-width':
      return parseFloat(element.style.width);
    case 'style-height':
      return parseFloat(element.style.height);
    case 'text':
      // If the element is a dropdown, read the selected value
      if (element.innerHTML && element.nodeName !== 'SELECT') {
        return utils.escapeText(element.innerHTML);
      } else {
        return utils.escapeText(element.value);
      }
    case 'textColor':
      return element.style.color;
    case 'backgroundColor':
      return element.style.backgroundColor;
    case 'fontSize':
      return parseFloat(element.style.fontSize);
    case 'textAlign':
      return element.style.textAlign;
    case 'icon-color':
      return element.getAttribute('data-icon-color');
    case 'image':
      return element.getAttribute('data-canonical-image-url');
    case 'screen-image':
      return element.getAttribute('data-canonical-image-url');
    case 'picture':
      return element.getAttribute('data-canonical-image-url');
    case 'hidden':
      return $(element).hasClass('design-mode-hidden');
    case 'checked':
      // element.checked represents the current state, the attribute represents
      // the serialized state
      return !!element.checked;
    case 'options':
      return $(element).children().map((i, child) => child.text).get();
    case 'groupId':
      return element.getAttribute('name');
    case 'placeholder':
      return element.getAttribute('placeholder');
    case 'readonly':
      return element.getAttribute('contenteditable') !== 'true';
    default:
      // The property was not found in the list of properties which apply to all elements.
      // Check to see if the element-specific handler knows how to read the property,
      // which will raise an error if the property or handler is not found.
      return elementLibrary.typeSpecificPropertyRead(element, name);
  }
};

designMode.onDuplicate = function (element, event) {
  let isScreen = $(element).hasClass('screen');
  if (isScreen) {
    return duplicateScreen(element);
  }

  var duplicateElement = $(element).clone(true)[0];
  var dupLeft = parseInt(element.style.left, 10) + 10;
  var dupTop = parseInt(element.style.top, 10) + 10;
  var dupWidth = parseInt(element.style.width, 10);
  var dupHeight = parseInt(element.style.height, 10);

  // Ensure the position of the duplicate element is within the bounds of the container
  var position = enforceContainment(dupLeft, dupTop, dupWidth, dupHeight);

  // Change the ID and location of the duplicate element
  duplicateElement.style.left = appendPx(position.left);
  duplicateElement.style.top = appendPx(position.top);

  var elementType = elementLibrary.getElementType(element);
  elementUtils.setId(duplicateElement, elementLibrary.getUnusedElementId(elementType.toLowerCase()));

  // Attach the duplicate element and then focus on it
  designMode.attachElement(duplicateElement);
  duplicateElement.focus();
  designMode.editElementProperties(duplicateElement);

  return duplicateElement;
};

function duplicateScreen(element) {
  const sourceScreen = $(element);
  const newScreen = designMode.createScreen();
  designMode.changeScreen(newScreen);

  // Unwrap the draggable wrappers around the elements in the source screen:
  const madeUndraggable = makeUndraggable(sourceScreen.children());

  // Clone each child of the source screen into the new screen (with new ids):
  sourceScreen.children().each(function () {
    const clonedChild = $(this).clone(true)[0];
    const elementType = elementLibrary.getElementType(clonedChild);
    elementUtils.setId(clonedChild, elementLibrary.getUnusedElementId(elementType.toLowerCase()));
    designMode.attachElement(clonedChild);
  });

  // Restore the draggable wrappers on the elements in the source screen:
  if (madeUndraggable) {
    makeDraggable(sourceScreen.children());
  }

  return newScreen;
}

designMode.onDeletePropertiesButton = function (element, event) {
  deleteElement(element);
};

function deleteElement(element) {
  var isScreen = $(element).hasClass('screen');
  if ($(element.parentNode).is('.ui-resizable')) {
    element = element.parentNode;
  }
  $(element).remove();

  if (isScreen) {
    designMode.loadDefaultScreen();
  } else {
    designMode.editElementProperties(
        elementUtils.getPrefixedElementById(
            getStore().getState().screens.currentScreenId));
  }
}

designMode.onDepthChange = function (element, depthDirection) {
  // move to outer resizable div
  var outerElement = element.parentNode;
  var parent = outerElement.parentNode;
  var index = Array.prototype.indexOf.call(parent.children, outerElement);

  if (depthDirection === 'forward' && index + 2 >= parent.children.length) {
    // We're either the last or second to last element
    depthDirection = 'toFront';
  }

  var removed;

  switch (depthDirection) {
    case 'forward':
      var twoAhead = outerElement.nextSibling.nextSibling;
      removed = parent.removeChild(outerElement);
      parent.insertBefore(removed, twoAhead);
      break;

    case 'toFront':
      removed = parent.removeChild(outerElement);
      parent.appendChild(removed);
      break;

    case 'backward':
      var previous = outerElement.previousSibling;
      if (!previous) {
        return;
      }

      removed = parent.removeChild(outerElement);
      parent.insertBefore(removed, previous);
      break;

    case 'toBack':
      if (parent.children.length === 1) {
        return;
      }
      removed = parent.removeChild(outerElement);
      parent.insertBefore(removed, parent.children[0]);
      break;

    default:
      throw new Error('unknown depthDirection: ' + depthDirection);
  }

  element.focus();
  designMode.editElementProperties(element);
};

designMode.onInsertEvent = function (code) {
  Applab.appendToEditor(code);
  getStore().dispatch(actions.changeInterfaceMode(ApplabInterfaceMode.CODE));
  Applab.scrollToEnd();
};

/**/
designMode.serializeToLevelHtml = function () {
  var designModeViz = $('#designModeViz');
  // Children are screens. Want to operate on grandchildren
  var madeUndraggable = makeUndraggable(designModeViz.children().children());

  // Make a copy so that we don't affect designModeViz contents as we
  // remove prefixes from the element ids.
  var designModeVizClone = designModeViz.clone();
  designModeVizClone.children().each(function () {
    elementUtils.removeIdPrefix(this);
  });
  designModeVizClone.children().children().each(function () {
    elementUtils.removeIdPrefix(this);
    if (this.nodeName === 'IMG') {
      // Remove object-fit style and all styles and attributes used by the
      // the object-fit-images polyfill for IE and replace the src attribute

      // (We will rely on our own data-object-fit property for serialization)
      this.style.objectFit = '';
      this.style.backgroundPosition = '';
      this.style.backgroundImage = '';
      this.style.backgroundRepeat = '';
      this.style.backgroundOrigin = '';
      this.style.backgroundSize = '';
      this.style.fontFamily = '';
      this.removeAttribute('data-ofi-undefined');
      // This data attribute comes from the object-fit-images polyfill used to
      // supply fit behavior in IE11
      // @see https://github.com/bfred-it/object-fit-images
      const ofiSrc = this.getAttribute('data-ofi-src');
      if (ofiSrc) {
        this.src = makeUrlProtocolRelative(ofiSrc);
        this.removeAttribute('data-ofi-src');
      }
    }
  });

  // Remove the "data:img/png..." URI from icon images
  designModeVizClone.find('[data-canonical-image-url^="' + ICON_PREFIX + '"]').each(function () {
    this.removeAttribute('src');
    this.style.backgroundImage = '';
  });

  var serialization = designModeVizClone[0] ? designModeVizClone[0].outerHTML : '';
  if (madeUndraggable) {
    makeDraggable(designModeViz.children().children());
  }

  Applab.levelHtml = serialization;
  return serialization;
};

function makeUrlProtocolRelative(url) {
  return url.replace(/^https?:\/\//i, '//');
}
designMode.makeUrlProtocolRelative = makeUrlProtocolRelative;

function getUnsafeHtmlReporter(sanitizationTarget) {
  return function (removed, unsafe, safe) {
    var msg = "The following lines of HTML were modified or removed:\n" + removed +
      "\noriginal html:\n" + unsafe + "\nmodified html:\n" + safe + "\ntarget: " + sanitizationTarget;
    console.log(msg);
    logToCloud.addPageAction(logToCloud.PageAction.SanitizedLevelHtml, {
      removedHtml: removed,
      unsafeHtml: unsafe,
      safeHtml: safe,
      sanitizationTarget: sanitizationTarget
    });
  };
}

/**
 * Parses/modifies a single screen's html representation as loaded from levelHTML.
 *
 * @param screenEl {Element|string} element encapsulating the dom for a single screen
 *     within a level's html. Can be a string of html as well. Note: If this is an element,
 *     then this function will have side effects.
 * @param allowDragging {boolean} Whether to make elements resizable and draggable.
 * @param prefix {string} Optional prefix to attach to element ids of children and
 *     grandchildren after parsing. Defaults to ''.
 *
 * @returns returns the modified version of the element passed in for screenEl.
 */
designMode.parseScreenFromLevelHtml = function (screenEl, allowDragging, prefix) {
  var screen = $(screenEl);
  elementUtils.addIdPrefix(screen[0], prefix);
  screen.children().each(function () {
    elementUtils.addIdPrefix(this, prefix);
  });

  if (allowDragging) {
    // screen are screens. make grandchildren draggable
    makeDraggable(screen.children());
  }

  elementLibrary.onDeserialize(screen[0], designMode.updateProperty.bind(this));
  screen.children().each(function () {
    var element = $(this).hasClass('ui-draggable') ? this.firstChild : this;
    elementLibrary.onDeserialize(element, designMode.updateProperty.bind(element));
  });
  return screen[0];
};

/**
 * Replace the contents of rootEl with the children of the DOM node obtained by
 * parsing Applab.levelHtml (the root node in the levelHtml is ignored).
 * @param rootEl {Element} Element whose children should be replaced.
 * @param allowDragging {boolean} Whether to make elements resizable and draggable.
 * @param prefix {string} Optional prefix to attach to element ids of children and
 *     grandchildren after parsing. Defaults to ''.
 */
designMode.parseFromLevelHtml = function (rootEl, allowDragging, prefix) {
  if (!rootEl) {
    return;
  }
  while (rootEl.firstChild) {
    rootEl.removeChild(rootEl.firstChild);
  }

  if (!Applab.levelHtml) {
    return;
  }

  var reportUnsafeHtml = getUnsafeHtmlReporter(rootEl.id);
  var levelDom = $.parseHTML(sanitizeHtml(Applab.levelHtml, reportUnsafeHtml, true));
  var children = $(levelDom).children();
  children.each(function () { designMode.parseScreenFromLevelHtml(this, allowDragging, prefix); });
  children.appendTo(rootEl);
};

/**
 * When we make elements resizable, we wrap them in an outer div. Given an outer
 * div, this returns the inner element
 */
function getInnerElement(outerElement) {
  // currently assume inner element is first child.
  return outerElement.children[0];
}

/**
 * Returns a new width/height bounded to the visualization area.
 * @param {number} left
 * @param {number} top
 * @param {number} width Requested width.
 * @param {number} height Requested height.
 * @param {boolean} preserveAspectRatio Constrain the width/height to the
 *   initial aspect ratio.
 * @return {{width: number, height: number}}
 */
function boundedResize(left, top, width, height, preserveAspectRatio) {
  var container = $('#designModeViz');
  var maxWidth = container.outerWidth() - left;
  var maxHeight = container.outerHeight() - top;
  var newWidth = Math.min(width, maxWidth);
  newWidth = Math.max(newWidth, 20);
  var newHeight = Math.min(height, maxHeight);
  newHeight = Math.max(newHeight, 20);

  if (preserveAspectRatio) {
    var ratio = Math.min(newWidth / width, newHeight / height);
    newWidth = width * ratio;
    newHeight = height * ratio;
  }

  return {width: newWidth, height: newHeight};
}

/**
 *
 * @param {jQuery} jqueryElements jQuery object containing DOM elements to make
 *   draggable.
 */
function makeDraggable(jqueryElements) {
  // For a non-div to be draggable & resizable it needs to be wrapped in a div.
  jqueryElements.each(function () {
    var elm = $(this);
    var wrapper = elm.wrap('<div>').parent().resizable({
      create: function () {
        // resizable sets z-index to 90, which we don't want
        $(this).children().css('z-index', '');
      },
      start: function () {
        highlightElement(elm[0]);
      },
      resize: function (event, ui) {
        // Wishing for a vector maths library...

        // Customize motion according to current visualization scale.
        var scale = getVisualizationScale();
        var deltaWidth = ui.size.width - ui.originalSize.width;
        var deltaHeight = ui.size.height - ui.originalSize.height;
        var newWidth = ui.originalSize.width + (deltaWidth / scale);
        var newHeight = ui.originalSize.height + (deltaHeight / scale);

        // Get positions that snap to the grid
        newWidth = gridUtils.snapToGridSize(newWidth);
        newHeight = gridUtils.snapToGridSize(newHeight);

        // Get positions that are bounded within app space
        var dimensions = boundedResize(ui.position.left, ui.position.top, newWidth, newHeight, false);

        // Update the position of wrapper (.ui-resizable) div
        ui.element.outerWidth(dimensions.width);
        ui.element.outerHeight(dimensions.height);

        // Set original element properties to update values in Property tab
        if (elm.is("canvas")) {
          // for canvas we need to set width/height attributes directly as these
          // control canvas size rather than style.width/style.height
          elm.attr('width', dimensions.width + "px");
          elm.attr('height', dimensions.height + "px");
        }
        // set style.width/style.height regardless, as this is used to size our
        // background image
        elm.outerWidth(dimensions.width);
        elm.outerHeight(dimensions.height);

        // Re-render design work space for this element
        designMode.renderDesignWorkspace(elm[0]);
      }
    }).draggable({
      cancel: false,  // allow buttons and inputs to be dragged
      start: function () {
        highlightElement(elm[0]);

        // Turn off clipping in app space so we can drag the element
        // out of it
        designMode.setAppSpaceClipping(false);
      },
      drag: function (event, ui) {
        // draggables are not compatible with CSS transform-scale,
        // so adjust the position in various ways here.

        // Scale position to express it relative to app-space (instead of screen-space)
        var scale = getVisualizationScale();
        var newLeft  = ui.position.left / scale;
        var newTop = ui.position.top / scale;

        // Get positions that snap to the grid
        newLeft = gridUtils.snapToGridSize(newLeft);
        newTop = gridUtils.snapToGridSize(newTop);

        // Update the position of wrapper (.ui-draggable) div to snap to grid
        ui.position.left = newLeft;
        ui.position.top = newTop;

        // Set original element properties to update values in Property tab
        elm.css({
          left: newLeft,
          top: newTop,
        });

        // Dim the element if it's dragged out of bounds
        if (!isMouseEventInBounds(event)) {
          elm.addClass("toDelete");
        } else {
          elm.removeClass("toDelete");
        }

        // Re-render design work space for this element
        designMode.renderDesignWorkspace(elm[0]);
      },
      stop: function (event, ui) {
        // Note: It looks like the ui.position values don't change between
        // the last drag event and the stop event. Since we already performed
        // the scale transformation on ui.position values in the drag handler,
        // there's no need to transform ui.position coordinates again here.

        // Check the drop location to determine whether we delete this element
        if (!isMouseEventInBounds(event)) {

          // It's dropped out of bounds, animate and delete
          ui.helper.hide( "drop", { direction: "down" }, ANIMATION_LENGTH_MS, function () {
            deleteElement(elm[0]);
          });

        } else {
          // Render design work space for this element
          designMode.renderDesignWorkspace(elm[0]);
        }

        // Turn clipping back on so it's not possible for elements
        // to bleed out of app space
        designMode.setAppSpaceClipping(true);
      },
    }).css({
      position: 'absolute',
      lineHeight: '0px'
    });

    wrapper.css({
      top: elm.css('top'),
      left: elm.css('left'),
    });

    // Chrome/Safari both have issues where they don't properly render the
    // wrapper if the inner element is a div. This is a hack that causes a
    // rerender to happen in chrome
    var currHeight = wrapper.parent().height();
    wrapper.parent().height(currHeight + 1);
    wrapper.parent().height(currHeight);

    // And a hack for Safari
    if (this.tagName === 'DIV') {
      setTimeout(function () {
        wrapper.hide().show(0);
      }, 0);
    }

    elm.css('position', 'static');
  });
  setTimeout(() => {
    applabObjectFitImages();
  }, 0);
}

/**
 * Provide coordinates for the element that are enforced within the container space.
 */
function enforceContainment(left, top, width, height) {
  var container = $('#designModeViz');
  var maxLeft = container.outerWidth() - width;
  var maxTop = container.outerHeight() - height;

  var newLeft = Math.min(left, maxLeft);
  newLeft = Math.max(newLeft, 0);
  var newTop = Math.min(top, maxTop);
  newTop = Math.max(newTop, 0);

  return {'left': newLeft, 'top': newTop};
}

/**
 * Tests whether the coordinates of the mouse event are inside designModeViz,
 * taking into account any scaling transforms that may be applied to designModeViz.
 * @param {jQuery.Event} mouseEvent
 * @returns {boolean}
 */
function isMouseEventInBounds(mouseEvent) {
  const container = $('#designModeViz');

  return gridUtils.isMouseEventInBounds(mouseEvent, container);
}

/**
 * Sets app space clipping behavior. App space is clipped if clip == true.
 * @param {boolean} clip
 */
designMode.setAppSpaceClipping = function (clip) {
  var container = $('#designModeViz');
  if (clip) {
    // Delay the clipping until we're done the delete/pushback animation
    container.delay(ANIMATION_LENGTH_MS).addClass('clip-content', ANIMATION_LENGTH_MS);
  } else {
    container.removeClass('clip-content');
  }
};

/**
 * Calculate the current visualization scale factor, as screenWidth / domWidth.
 * @returns {number}
 */
function getVisualizationScale() {
  var div = document.getElementById('designModeViz');
  return div.getBoundingClientRect().width / div.offsetWidth;
}


/**
 * Inverse of `makeDraggable`.
 * @param {jQuery} jqueryElements jQuery object containing DOM elements to make
 *   undraggable.
 * @returns {boolean} True if we made something undraggable
 */
function makeUndraggable(jqueryElements) {
  var foundOne = false;
  jqueryElements.each(function () {
    var wrapper = $(this);
    var elm = $(getInnerElement(this));

    // Don't unwrap elements that aren't wrapped with a draggable div.
    if (!wrapper.hasClass('ui-draggable')) {
      return;
    }

    foundOne = true;

    wrapper.resizable('destroy').draggable('destroy');
    elm.css('position', 'absolute');
    elm.unwrap();
  });

  return foundOne;
}

/**
 * Highlights an element with a dashed border, removes border from all other elements
 * Must only be called on an element wrapped in a draggable div
 */
function highlightElement(element) {
  removeElementHighlights();

  if ($(element).is('#designModeViz img[src!=""], #designModeViz label')) {
    $(element).parent().css({
      outlineStyle: 'dashed',
      outlineWidth: '1px',
    });
  }
}

/**
 * Remove dashed borders from all elements
 */
function removeElementHighlights() {
  $('#designModeViz .ui-draggable').css({
    outlineStyle: '',
    outlineWidth: ''
  });
}

designMode.configureDragAndDrop = function () {
  // Allow elements to be dragged and dropped from the design mode
  // element tray to the play space.
  $('#visualization').droppable({
    accept: '.new-design-element',
    activate: function (event, ui) {
      // Turn off clipping in app space so we can drag the element
      // into and out of it
      designMode.setAppSpaceClipping(false);
    },
    deactivate: function (event, ui) {
      // Turn clipping back on so it's not possible for elements
      // to bleed out of app space
      designMode.setAppSpaceClipping(true);
    },
    drop: function (event, ui) {
      var elementType = ui.draggable[0].getAttribute('data-element-type');

      var point = gridUtils.scaledDropPoint(ui.helper);

      var element = designMode.createElement(elementType, point.left, point.top);
      if (elementType === elementLibrary.ElementType.SCREEN) {
        designMode.changeScreen(elementUtils.getId(element));
      }

      // Move the element into the app space bounds
      moveElementIntoBounds(element);

      if (elementType === elementLibrary.ElementType.IMAGE) {
        var parent = $(element).parent();
        // Safari has some weird bug where it doesn't end up rendering our dropped
        // image for some reason. We get around that by moving the image to the
        // wrong location, and then moving it back to the right location (which
        // forces a rerender at which point safari does the right thing)
        if (parent.width() === 0) {
          var origLeft = parent.css('left');
          parent.css('visibility', 'hidden');
          parent.css('left', '0px');
          setTimeout(function () {
            parent.css('left', origLeft);
            parent.css('visibility', '');
          }, 1);
        }
      }

      // Re-render design work space for this element
      designMode.renderDesignWorkspace(element);
    }
  });
};

/**
 * Given a design element, move and animate it into the bounds of app space.
 * Assumption: The design element is wrapped in a .ui-draggable wrapper already.
 * @param {HTMLElement} The HTMLElement representing the design element.
 */
function moveElementIntoBounds(element) {
  // Get the element's wrapper.
  // If it doesn't exist (e.g. for a SCREEN element), return.
  if ($(element).parent('.ui-draggable').length === 0) {
    return;
  }

  // Get the element's dimensions
  var width = parseFloat($(element).css('width'));
  var height = parseFloat($(element).css('height'));

  // Get the wrapper's position within the app space
  var elm = $(element).parent('.ui-draggable');
  var left = parseFloat(elm.css('left'));
  var top = parseFloat(elm.css('top'));

  var newContainedPos = enforceContainment(left, top, width, height);

  // Slide animate the wrapper back into the app space
  elm.animate({
    left: newContainedPos.left,
    top: newContainedPos.top,
  }, ANIMATION_LENGTH_MS);

  // Update position on original element to update values in Property tab
  $(element).css({
    left: newContainedPos.left,
    top: newContainedPos.top,
  });
}

/**
 * Create a new screen
 * @returns {string} The id of the newly created screen
 */
designMode.createScreen = function () {
  var newScreen = elementLibrary.createElement('SCREEN', 0, 0);
  $("#designModeViz").append(newScreen);

  return elementUtils.getId(newScreen);
};

/**
 * Changes the active screen by triggering a 'CHANGE_SCREEN' action on the
 * Redux store.  This change propagates across the app, updates the state of
 * React-rendered components, and eventually calls renderScreens, below.
 * @param {!string} screenId
 */
designMode.changeScreen = function (screenId) {
  getStore().dispatch(screens.changeScreen(screenId));
};

/**
 * Given the currentScreenId in our redux store, toggles all screens to be
 * non-visible, unless they match the provided screenId, with the element
 * property editor for the new screen.
 *
 * This method is called in response to a change in the application state.  If
 * you want to change the current screen, call designMode.changeScreen instead.
 *
 * @param {!string} screenId
 */
function renderScreens(screenId) {
  // Update which screen is shown in run mode
  Applab.changeScreen(getStore().getState().screens.currentScreenId);

  elementUtils.getScreens().each(function () {
    $(this).toggle(elementUtils.getId(this) === screenId);
  });
  designMode.editElementProperties(elementUtils.getPrefixedElementById(screenId));

  // We still have to call render() to get an updated list of screens, in case
  // we added or removed one.  Can probably stop doing this once the screens
  // list is also in Redux and managed through actions.
  Applab.render();
}

/** @returns {string[]} Array of all screen Ids in current app */
designMode.getAllScreenIds = function () {
  return elementUtils.getScreens().get().map(function (screen) {
    return elementUtils.getId(screen);
  });
};

/**
 * Load our default screen (ie. the first one in the DOM), creating a screen
 * if we have none.
 */
designMode.loadDefaultScreen = function () {
  var defaultScreen;

  if (elementUtils.getScreens().length === 0) {
    defaultScreen = designMode.createScreen();
  } else {
    defaultScreen = elementUtils.getDefaultScreenId();
  }
  designMode.changeScreen(defaultScreen);
};

designMode.renderDesignWorkspace = function (element) {
  var designWorkspace = document.getElementById('designWorkspace');
  if (!designWorkspace) {
    return;
  }

  var props = {
    handleDragStart: function () {
      if ($('#resetButton').is(':visible')) {
        studioApp().resetButtonClick();
      }
    },
    element: element || null,
    elementIdList: Applab.getIdDropdownForCurrentScreen(),
    handleChange: designMode.onPropertyChange.bind(this, element),
    onChangeElement: designMode.editElementProperties.bind(this),
    onDepthChange: designMode.onDepthChange,
    onDuplicate: designMode.onDuplicate.bind(this, element),
    onDelete: designMode.onDeletePropertiesButton.bind(this, element),
    onInsertEvent: designMode.onInsertEvent.bind(this),
    handleVersionHistory: Applab.handleVersionHistory,
    isDimmed: Applab.running,
    store: getStore(),
  };
  ReactDOM.render(React.createElement(DesignWorkspace, props), designWorkspace);
};

/**
 * Early versions of applab didn't have screens, and instead all elements
 * existed under the root div. If we find one of those, convert it to be a single
 * screen app.
 */
designMode.addScreenIfNecessary = function (html) {
  var reportUnsafeHtml = getUnsafeHtmlReporter('levelHtml');
  html = sanitizeHtml(html, reportUnsafeHtml, true);
  var rootDiv = $(html);
  if (rootDiv.children().length === 0 ||
      rootDiv.children().eq(0).hasClass('screen')) {
    // no children, or first child is a screen
    return html;
  }

  var screenElement = elementLibrary.createElement(
    elementLibrary.ElementType.SCREEN);
  rootDiv.children().appendTo(screenElement);
  rootDiv.append(screenElement);

  return rootDiv[0].outerHTML;
};

designMode.addKeyboardHandlers = function () {
  $('#designModeViz').keydown(function (event) {
    if (!Applab.isInDesignMode() || Applab.isRunning()) {
      return;
    }

    // Check for copy and paste events
    if (event.altKey || event.ctrlKey || event.metaKey) {
      switch (event.which) {
        case KeyCodes.COPY:
          if (currentlyEditedElement) {
            // Remember the current element on the clipboard
            clipboardElement = $(currentlyEditedElement).clone(true)[0];
          }
          break;
        case KeyCodes.PASTE:
          // Paste the clipboard element with updated position and ID
          if (clipboardElement) {
            let duplicateElement = designMode.onDuplicate(clipboardElement);
            if (duplicateElement) {
              clipboardElement = $(duplicateElement).clone(true)[0];
            }
          }
          break;
        default:
          return;
      }
    }

    if (!currentlyEditedElement || $(currentlyEditedElement).hasClass('screen')) {
      return;
    }

    var current, property, newValue;

    // Check for keys that change element properties
    switch (event.which) {
      case KeyCodes.LEFT:
        current = parseInt(currentlyEditedElement.style.left, 10);
        newValue = current - 1;
        property = 'left';
        break;
      case KeyCodes.RIGHT:
        current = parseInt(currentlyEditedElement.style.left, 10);
        newValue = current + 1;
        property = 'left';
        break;
      case KeyCodes.UP:
        current = parseInt(currentlyEditedElement.style.top, 10);
        newValue = current - 1;
        property = 'top';
        break;
      case KeyCodes.DOWN:
        current = parseInt(currentlyEditedElement.style.top, 10);
        newValue = current + 1;
        property = 'top';
        break;
      default:
        return;
    }
    designMode.onPropertyChange(currentlyEditedElement, property, newValue);

  });
};

designMode.resetIds = function () {
  elementLibrary.resetIds();
};

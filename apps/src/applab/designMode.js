/* global $, Applab */

// TODO (brent) - make sure you consider transition to screens from no screens

// TODO (brent) - make it so that we dont need to specify .jsx. This currently
// works in our grunt build, but not in tests
var React = require('react');
var DesignModeBox = require('./DesignModeBox.jsx');
var DesignModeHeaders = require('./DesignModeHeaders.jsx');
var DesignProperties = require('./designProperties.jsx');
var DesignToggleRow = require('./DesignToggleRow.jsx');
var showAssetManager = require('./assetManagement/show.js');
var elementLibrary = require('./designElements/library');
var studioApp = require('../StudioApp').singleton;
var _ = require('../utils').getLodash();

var designMode = module.exports;

var currentlyEditedElement = null;

var GRID_SIZE = 5;

/**
 * If in design mode and program is not running, display Properties
 * pane for editing the clicked element.
 * @param event
 */
designMode.onDivApplabClick = function (event) {
  if (!Applab.isInDesignMode() ||
      $('#resetButton').is(':visible')) {
    return;
  }
  event.preventDefault();

  var element = event.target;
  if (element.id === 'divApplab') {
    designMode.clearProperties();
  } else {
    designMode.editElementProperties(element);
  }
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

  var parent;
  if ($(element).hasClass('screen')) {
    parent = document.getElementById('divApplab');
  } else {
    parent = $('.screen').filter(':visible').first()[0];
  }
  parent.appendChild(element);
  makeDraggable($(element));
  designMode.editElementProperties(element);
  designMode.serializeToLevelHtml();

  return element;
};

designMode.editElementProperties = function(element) {
  var designPropertiesElement = document.getElementById('design-properties');
  if (!designPropertiesElement) {
    // design-properties won't exist when !user.isAdmin
    return;
  }
  currentlyEditedElement = element;
  designMode.renderDesignModeBox(element);
};

/**
 * Clear the Properties pane of applab's design mode.
 */
designMode.clearProperties = function () {
  designMode.editElementProperties(null);
};

/**
 * Enable (or disable) dragging of new elements from the element tray,
 * and show (or hide) the 'Clear' button.
 * @param allowEditing {boolean}
 */
designMode.resetElementTray = function (allowEditing) {
  $('#design-toolbox .new-design-element').each(function() {
    $(this).draggable(allowEditing ? 'enable' : 'disable');
  });
  var designModeClear = document.getElementById('designModeClear');
  if (designModeClear) {
    designModeClear.style.display = allowEditing ? 'inline-block' : 'none';
  }
};

// TODO (brent) I think some of these properties are going to end up having
// different behaviors based on element type. I think the best way of handling
// this is to have an onPropertyChange per element that gets the first shot to
// handle the change, and reports whether it did or not. If it didn't, we fall
// back to the default function
designMode.onPropertyChange = function(element, name, value) {
  switch (name) {
    case 'id':
      element.id = value;
      break;
    case 'left':
      element.style.left = value + 'px';
      break;
    case 'top':
      element.style.top = value + 'px';
      break;
    case 'width':
      element.style.width = value + 'px';
      break;
    case 'height':
      element.style.height = value + 'px';
      break;
    case 'text':
      element.textContent = value;
      break;
    case 'textColor':
      element.style.color = value;
      break;
    case 'backgroundColor':
      element.style.backgroundColor = value;
      break;
    case 'fontSize':
      element.style.fontSize = value + 'px';
      break;
    case 'image':
      // For now, we stretch the image to fit the element
      var width = parseInt(element.style.width, 10);
      var height = parseInt(element.style.height, 10);
      element.style.backgroundImage = 'url(' + value + ')';
      element.style.backgroundSize = width + 'px ' + height + 'px';
      break;
    case 'picture':
      element.src = value;
      element.onload = function () {
        // naturalWidth/Height aren't populated until image has loaded.
        element.style.width = element.naturalWidth + 'px';
        element.style.height = element.naturalHeight + 'px';
        // Re-render properties
        if (currentlyEditedElement === element) {
          designMode.editElementProperties(element);
        }
      };
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
      for (i = value.length; i < element.children.length; i++) {
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
    default:
      throw "unknown property name " + name;
  }
  designMode.serializeToLevelHtml();
};

designMode.onDonePropertiesButton = function() {
  designMode.clearProperties();
};

designMode.onDeletePropertiesButton = function(element, event) {
  element.parentNode.removeChild(element);
  designMode.serializeToLevelHtml();
  designMode.clearProperties();
};

designMode.onDepthChange = function (element, depthDirection) {
  var parent = element.parentNode;
  var index = Array.prototype.indexOf.call(parent.children, element);

  if (depthDirection === 'forward' && index + 2 >= parent.children.length) {
    // We're either the last or second to last element
    depthDirection = 'toFront';
  }

  var removed;

  // TODO (brent) - use an enum?
  switch (depthDirection) {
    case 'forward':
      var twoAhead = element.nextSibling.nextSibling;
      removed = parent.removeChild(element);
      parent.insertBefore(removed, twoAhead);
      break;

    case 'toFront':
      removed = parent.removeChild(element);
      parent.appendChild(removed);
      break;

    case 'backward':
      var previous = element.previousSibling;
      if (!previous) {
        return;
      }

      removed = parent.removeChild(element);
      parent.insertBefore(removed, previous);
      break;

    case 'toBack':
      if (parent.children.length === 1) {
        return;
      }
      removed = parent.removeChild(element);
      parent.insertBefore(removed, parent.children[0]);
      break;

    default:
      throw new Error('unknown depthDirection: ' + depthDirection);
  }

  element.focus();
  designMode.editElementProperties(element);
};

designMode.serializeToLevelHtml = function () {
  var divApplab = $('#divApplab');
  makeUndraggable(divApplab.children());
  var s = new XMLSerializer().serializeToString(divApplab[0]);
  makeDraggable(divApplab.children());
  Applab.levelHtml = s;
};

/**
 * @param rootEl {Element}
 * @param allowDragging {boolean}
 */
designMode.parseFromLevelHtml = function(rootEl, allowDragging) {
  if (!Applab.levelHtml) {
    return;
  }
  var levelDom = $.parseHTML(Applab.levelHtml);
  var children = $(levelDom).children();
  children.appendTo(rootEl);
  if (allowDragging) {
    makeDraggable(children);
  }

  children.each(function () {
    elementLibrary.onDeserialize($(this)[0]);
  });
};

designMode.onClear = function() {
  document.getElementById('divApplab').innerHTML = Applab.levelHtml = "";
  elementLibrary.resetIds();
  designMode.createElement(elementLibrary.ElementType.SCREEN, 0, 0);
  designMode.changeScreen('screen1');
};

function toggleDragging (enable) {
  var children = $('#divApplab').children();
  if (enable) {
    makeDraggable(children);
  } else {
    makeUndraggable(children);
  }
}

designMode.toggleDesignMode = function(enable) {
  var designModeHeaders = document.getElementById('designModeHeaders');
  if (!designModeHeaders) {
    // Currently we don't run design mode in some circumstances (i.e. user is
    // not an admin)
    return;
  }
  designModeHeaders.style.display = enable ? 'block' : 'none';

  var codeModeHeaders = document.getElementById('codeModeHeaders');
  codeModeHeaders.style.display = enable ? 'none' : 'block';

  var codeTextbox = document.getElementById('codeTextbox');
  codeTextbox.style.display = enable ? 'none' : 'block';
  var designModeBox = document.getElementById('designModeBox');
  designModeBox.style.display = enable ? 'block' : 'none';

  var debugArea = document.getElementById('debug-area');
  debugArea.style.display = enable ? 'none' : 'block';

  $("#divApplab").toggleClass('divApplabDesignMode', enable);

  toggleDragging(enable);
};

/**
 *
 * @param {jQuery} jq jQuery object containing DOM elements to make draggable.
 */
function makeDraggable (jq) {
  // For a non-div to be draggable & resizable it needs to be wrapped in a div.
  jq.each(function () {
    var elm = $(this);
    var wrapper = elm.wrap('<div>').parent().resizable({
      alsoResize: elm,
      stop: function () {
        Applab.levelHtml = designMode.serializeToLevelHtml();
      }
    }).draggable({
      cancel: false,  // allow buttons and inputs to be dragged
      drag: function (event, ui) {
        // draggables are not compatible with CSS transform-scale,
        // so adjust the position in various ways here.

        // dragging
        var div = document.getElementById('divApplab');
        var xScale = div.getBoundingClientRect().width / div.offsetWidth;
        var yScale = div.getBoundingClientRect().height / div.offsetHeight;
        var changeLeft = ui.position.left - ui.originalPosition.left;
        var newLeft  = (ui.originalPosition.left + changeLeft) / xScale;
        var changeTop = ui.position.top - ui.originalPosition.top;
        var newTop = (ui.originalPosition.top + changeTop) / yScale;

        // snap top-left corner to nearest location in the grid
        newLeft -= (newLeft + GRID_SIZE / 2) % GRID_SIZE - GRID_SIZE / 2;
        newTop -= (newTop + GRID_SIZE / 2) % GRID_SIZE - GRID_SIZE / 2;

        // containment
        var container = $('#divApplab');
        var maxLeft = container.outerWidth() - ui.helper.outerWidth(true);
        var maxTop = container.outerHeight() - ui.helper.outerHeight(true);
        newLeft = Math.min(newLeft, maxLeft);
        newLeft = Math.max(newLeft, 0);
        newTop = Math.min(newTop, maxTop);
        newTop = Math.max(newTop, 0);

        ui.position.left = newLeft;
        ui.position.top = newTop;
      },
      stop: function () {
        Applab.levelHtml = designMode.serializeToLevelHtml();
      }
    }).css('position', 'absolute');

    wrapper.css({
      top: elm.css('top'),
      left: elm.css('left')
    });

    elm.css({
      position: ''
    });
  });
}

/**
 * Inverse of `makeDraggable`.
 * @param {jQuery} jq jQuery object containing DOM elements to make undraggable.
 */
function makeUndraggable(jq) {
  jq.each(function () {
    var wrapper = $(this);
    var elm = $(':first-child', wrapper);

    // Don't unwrap elements that aren't wrapped with a draggable div.
    if (!wrapper.data('uiDraggable')) {
      return;
    }

    wrapper.resizable('destroy').draggable('destroy');
    elm.css({
      top: wrapper.css('top'),
      left: wrapper.css('left'),
      position: 'absolute'
    });
    elm.unwrap();
  });
}

designMode.configureDragAndDrop = function () {
  // Allow elements to be dragged and dropped from the design mode
  // element tray to the play space.
  $('#visualization').droppable({
    accept: '.new-design-element',
    drop: function (event, ui) {
      var elementType = ui.draggable[0].dataset.elementType;

      var div = document.getElementById('divApplab');
      var xScale = div.getBoundingClientRect().width / div.offsetWidth;
      var yScale = div.getBoundingClientRect().height / div.offsetHeight;

      var left = ui.position.left / xScale;
      var top = ui.position.top / yScale;

      // snap top-left corner to nearest location in the grid
      left -= (left + GRID_SIZE / 2) % GRID_SIZE - GRID_SIZE / 2;
      top -= (top + GRID_SIZE / 2) % GRID_SIZE - GRID_SIZE / 2;

      var element = designMode.createElement(elementType, left, top);
      if (elementType === elementLibrary.ElementType.SCREEN) {
        designMode.changeScreen(element.id);
      }
    }
  });
};

designMode.configureDesignToggleRow = function () {
  var designToggleRow = document.getElementById('designToggleRow');
  if (!designToggleRow) {
    return;
  }

  // Simulate a run button click, to load the channel id.
  var designModeClick = studioApp.runButtonClickWrapper.bind(
      studioApp, Applab.onDesignModeButton);
  var throttledDesignModeClick = _.debounce(designModeClick, 250, true);

  var firstScreen = $('.screen').first().attr('id');
  designMode.changeScreen(firstScreen);
};

designMode.changeScreen = function (screenId) {
  // TODO (brent) - may end up wanting to share some of this code with our
  // API that allows changing the screen. or at the least come up with a good
  // name to indicate how this and the api function are different
  // Ignore screen changes while running
  if (Applab.isRunning()) {
    return;
  }

  var screenIds = [];
  $('.screen').each(function () {
    screenIds.push(this.id);
    $(this).toggle(this.id === screenId);
  });

  var designToggleRow = document.getElementById('designToggleRow');

  if (designToggleRow) {
    React.render(
      React.createElement(DesignToggleRow, {
        initialScreen: screenId,
        screens: screenIds,
        onDesignModeButton: Applab.onDesignModeButton,
        onCodeModeButton: Applab.onCodeModeButton,
        handleManageAssets: showAssetManager,
        onScreenChange: designMode.changeScreen
      }),
      designToggleRow
    );
  }

  designMode.serializeToLevelHtml();

  designMode.editElementProperties(document.getElementById(screenId));
};
designMode.renderDesignModeBox = function(element) {
  var designModeBox = document.getElementById('designModeBox');
  if (!designModeBox) {
    return;
  }

  var props = {
    handleDragStart: function() {
      if ($('#resetButton').is(':visible')) {
        studioApp.resetButtonClick();
      }
    },
    element: element || null,
    handleChange: designMode.onPropertyChange.bind(this, element),
    onDepthChange: designMode.onDepthChange,
    onDone: designMode.onDonePropertiesButton,
    onDelete: designMode.onDeletePropertiesButton.bind(this, element),
  };
  React.render(React.createElement(DesignModeBox, props), designModeBox);
};

designMode.configureDesignModeHeaders = function() {
  var designModeHeaders = document.getElementById('designModeHeaders');
  if (!designModeHeaders) {
    return;
  }

  React.render(React.createElement(DesignModeHeaders), designModeHeaders);
};

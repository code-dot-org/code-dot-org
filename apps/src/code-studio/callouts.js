import $ from 'jquery';
import 'qtip2';
var clientState = require('./clientState');

let hiddenCallouts = {};
let allCallouts = [];

/**
 * @fileoverview handles creation and updating of dashboard tooltips, aka callouts.
 *
 * Assumes existence of jQuery qtip2 plugin.
 */

/**
 * A callout definition object, typically defined in the levelbuilder, stored
 * per-level.
 * @typedef {Object} CalloutDefinition
 * @property {string} localized_text - text contents for callout
 * @property {string} element_id - jQuery selector of element to attach
 *           callout to (shows relative to element position, callout hides on
 *           element click)
 * @property {object} qtip_config - qtip configuration for callout
 *           @see {@link http://qtip2.com/options} for full list of options
 * @property {?string} on - optional ID of window event which should trigger
 *           callout show. Callout starts hidden.
 */

/**
 * Given a set of callout definitions, installs them on the page
 * @param {CalloutDefinition[]} callouts
 */
export default function createCallouts(callouts) {
  allCallouts = [];
  hiddenCallouts = {};
  if (!callouts || callouts.length === 0) {
    return;
  }

  // Hide callouts when the function editor is closed (otherwise they jump to
  // the top left corner)
  $(window).on('function_editor_closed', function () {
    $('.cdo-qtips').qtip('hide');
  });

  // Update callout positions when a blockly editor is scrolled.
  $(window).on('block_space_metrics_set', handleWorkspaceResizeOrScroll);
  // Update callout positions when the browser is resized.
  window.addEventListener('resize', handleWorkspaceResizeOrScroll);

  $(window).on('droplet_change', function (e, dropletEvent) {
    switch (dropletEvent) {
      case 'scrollace':
        // Destroy all ace gutter tooltips on scroll. Ace dynamically reuses
        // gutter elements with a scroll of even a singe line, moving one line
        // number to a different DOM element, so the only ways to track with the
        // gutter movement would be to manually adjust position or to destroy
        // the qtips and manually recreate new ones with each scroll.
        $('.cdo-qtips').each(function () {
          var api = $(this).qtip('api');
          var target = $(api.elements.target);
          if ($('.ace_gutter').has(target)) {
            api.destroy();
          }
        });
        return;
      case 'scrollpalette':
      case 'scrolleditor':
        snapCalloutsToTargets();
        break;
    }
    showHidePaletteCallouts();
    showHideDropletGutterCallouts();
  });

  addCallouts(callouts);

  // Insert a hashchange handler to detect triggercallout= hashes and fire
  // appropriate events to open the callout
  function detectTriggerCalloutOnHash(event) {
    var loc = window.location;
    var splitHash = loc.hash.split('#triggercallout=');
    if (splitHash.length > 1) {
      var eventName = splitHash[1];
      var eventType = (event && event.type) || 'hashinit';
      $(window).trigger(eventName, [eventType]);
      // NOTE: normally we go back to avoid populating history, but not during init
      if (window.history.go && eventType === 'hashchange') {
        history.go(-1);
      } else {
        loc.hash = '';
      }
    }
  }

  // Call once during init to detect the hash from the initial page load
  detectTriggerCalloutOnHash();
  // Call again when the hash changes:
  $(window).on('hashchange', detectTriggerCalloutOnHash);
}

export function addCallouts(callouts) {
  $.fn.qtip.zindex = 500;

  var showCalloutsMode = document.URL.indexOf('show_callouts=1') !== -1;
  callouts.forEach(function (callout) {
    var selector = callout.element_id; // jquery selector.
    console.log(`setting up callout ${selector}`);
    if ($(selector).length === 0 && !callout.on) {
      console.log(`could not find selector ${selector}`);
      return;
    }
    const container = $('#codeWorkspace');

    var defaultConfig = {
      codeStudio: {},
      content: {
        text: callout.localized_text,
        title: {
          button: $('<div class="tooltip-x-close"/>'),
        },
      },
      style: {
        classes: '',
        tip: {
          width: 20,
          height: 20,
        },
      },
      position: {
        my: 'bottom left',
        at: 'top right',
      },
      hide: {
        event: 'click mousedown touchstart',
      },
      show: false, // don't show on mouseover
    };

    var customConfig =
      typeof callout.qtip_config === 'string'
        ? $.parseJSON(callout.qtip_config)
        : callout.qtip_config;
    var config = $.extend(true, {}, defaultConfig, customConfig);
    config.style.classes = config.style.classes.concat(' cdo-qtips');

    callout.seen = clientState.hasSeenCallout(callout.id);
    if (showCalloutsMode) {
      callout.seen = false;
    } else {
      if (callout.seen && !config.codeStudio.canReappear) {
        return;
      }
      if (!callout.seen) {
        clientState.recordCalloutSeen(callout.id);
      }
    }

    if (callout.hide_target_selector) {
      config.hide.target = $(callout.hide_target_selector);
    }

    // Reverse callouts in RTL mode
    if ($('html[dir=rtl]').length) {
      config.position.my = reverseCallout(config.position.my);
      config.position.at = reverseCallout(config.position.at);
      if (config.position.adjust) {
        config.position.adjust.x *= -1;
      }
    }

    // Flip the close button if it would overlap the qtip
    if (
      config.position.my === 'top right' ||
      config.position.my === 'right top'
    ) {
      config.style.classes += ' flip-x-close';
    }

    if (callout.on) {
      $(window).on(callout.on, function (e, action) {
        if (!config.codeStudio.selector) {
          config.codeStudio.selector = selector;
        }
        var lastSelector = config.codeStudio.selector;
        $(window).trigger('prepareforcallout', [config.codeStudio]);
        if (
          lastSelector !== config.codeStudio.selector &&
          $(lastSelector).length > 0
        ) {
          $(lastSelector).qtip(config).qtip('destroy');
        }
        // 'show' after async delay so that DOM changes that may have taken
        // place inside the 'prepareforcallout' event can complete first
        console.log('in callout.on');
        setTimeout(function () {
          console.log('in callout.on setTimeout');
          if ($(config.codeStudio.selector).length > 0) {
            if (
              action === 'hashchange' ||
              action === 'hashinit' ||
              !callout.seen ||
              config.codeStudio.canReappear
            ) {
              // create callout(s)
              $(config.codeStudio.selector).qtip(config);
              allCallouts.push(config.codeStudio.selector);
              showHideCalloutsOnInit(config.codeStudio.selector, container);
            }
            callout.seen = true;
          }
        }, 0);
      });
    } else if (!callout.seen) {
      // create callout(s)
      $(selector).qtip(config);
      allCallouts.push(selector);
      showHideCalloutsOnInit(selector, container);
    }
  });
  // Ensure any callouts pointing to hidden elements are hidden.
  showHideWorkspaceCallouts();
}

export function handleWorkspaceResizeOrScroll() {
  snapCalloutsToTargets();
  showHideWorkspaceCallouts();
}

function showHideCalloutsOnInit(selector, container) {
  console.log({selector: $(selector)});
  $(selector).each(function () {
    console.log($(this));
    const api = $(this).qtip('api');
    if (calloutShouldBeVisible(container, api)) {
      console.log(`showing ${api.id}`);
      api.show();
    } else {
      console.log(`keeping ${api.id} hidden`);
      api.hide();
      hiddenCallouts[api.id] = true;
    }
  });
}

/**
 * Snap all callouts to their target positions.  Keeps them in
 * position when blockspace is scrolled.
 */
function snapCalloutsToTargets() {
  var triggerEvent = null;
  var animate = false;
  $('.cdo-qtips').qtip('reposition', triggerEvent, animate);
}

export var showHideWorkspaceCallouts =
  showOrHideCalloutsByTargetVisibility('#codeWorkspace');
var showHidePaletteCallouts = showOrHideCalloutsByTargetVisibility(
  '.droplet-palette-scroller'
);
var showHideDropletGutterCallouts =
  showOrHideCalloutsByTargetVisibility('.droplet-gutter');

/**
 * For callouts with targets in the containerSelector (blockly, flyout elements,
 * function editor elements, etc) hides callouts with targets that are
 * scrolled out of view, and shows them again when they are scrolled back in
 * to view.
 * @function
 */
function showOrHideCalloutsByTargetVisibility(containerSelector) {
  // Close around this object, which we use to remember which callouts
  // were hidden by scrolling and should be shown again when they scroll
  // back in.
  /**
   * Remember callouts hidden due to overlap, keyed by qtip id
   * @type {Object.<string, boolean>}
   */
  return function () {
    var container = $(containerSelector);
    allCallouts.forEach(function (selector) {
      $(selector).each(function () {
        var api = $(this).qtip('api');
        console.log(`checking ${api.id}`);
        var target = $(api.elements.target);

        if ($(document).has(target).length === 0) {
          //api.destroy(true);
          return;
        }

        var isTargetInContainer = container.has(target).length > 0;
        if (!isTargetInContainer) {
          return;
        }
        const shouldBeVisible = calloutShouldBeVisible(container, api);
        if (shouldBeVisible && hiddenCallouts[api.id]) {
          console.log(`${api.id} should be visible and is currently hidden`);
          api.show();
          delete hiddenCallouts[api.id];
        } else if (!shouldBeVisible && !hiddenCallouts[api.id]) {
          console.log(
            `${api.id} should be not visible and is currently visible`
          );
          api.hide();
          hiddenCallouts[api.id] = true;
        }
      });
    });
  };
}

function calloutShouldBeVisible(container, qtipApi) {
  var target = $(qtipApi.elements.target);
  var isTargetInContainer = container.has(target).length > 0;
  if (!isTargetInContainer) {
    // Case of a callout outside of the workspace, which we always show.
    return true;
  }
  const isContainerVisible = container.is(':visible');
  const elementIsContained = target && elementIsInContainer(target, container);
  console.log({id: qtipApi.id, isContainerVisible, elementIsContained});
  return isContainerVisible && elementIsContained;
}

function reverseCallout(position) {
  position = position.split(/\s+/);
  return reverseDirection(position[0]) + ' ' + reverseDirection(position[1]);
}

function reverseDirection(token) {
  switch (token) {
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    default:
      return token;
  }
}

// Return true if the element is fully contained within the container.
function elementIsInContainer(element, container) {
  var elementRect = element[0].getBoundingClientRect();
  var containerRect = container[0].getBoundingClientRect();
  return (
    elementRect.left >= containerRect.left &&
    elementRect.right <= containerRect.right &&
    elementRect.top >= containerRect.top &&
    elementRect.bottom <= containerRect.bottom
  );
}

/* global $ */

var clientState = require('./clientState');

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
module.exports = function createCallouts(callouts) {
  if (!callouts) {
    return;
  }

  if (document.URL.indexOf('show_callouts=1') === -1) {
    callouts = callouts.filter(function (element, index, array) {
      if (clientState.hasSeenCallout(element.id)) {
        return false;
      } else {
        clientState.recordCalloutSeen(element.id);
        return true;
      }
    });
  }

  if (!callouts || callouts.length === 0) {
    return;
  }

  // Hide callouts when the function editor is closed (otherwise they jump to
  // the top left corner)
  $(window).on('function_editor_closed', function () {
    $('.cdo-qtips').qtip('hide');
  });

  // Update callout positions when an editor is scrolled.
  $(window).on('block_space_metrics_set', function () {
    snapCalloutsToTargets();
    showOrHideCalloutsByTargetVisibility();
  });

  $.fn.qtip.zindex = 500;
  callouts.forEach(function(callout) {
    var selector = callout.element_id; // jquery selector.
    if ($(selector).length === 0 && !callout.on) {
      return;
    }

    var defaultConfig = {
      content: {
        text: callout.localized_text,
        title: {
          button: $('<div class="tooltip-x-close"/>')
        }
      },
      style: {
        classes: "",
        tip: {
          width: 20,
          height: 20
        }
      },
      position: {
        my: "bottom left",
        at: "top right"
      },
      hide: {
        event: 'click mousedown touchstart'
      },
      show: false // don't show on mouseover
    };

    var customConfig = typeof callout.qtip_config === 'string' ?
        $.parseJSON(callout.qtip_config) : callout.qtip_config;
    var config = $.extend(true, {}, defaultConfig, customConfig);
    config.style.classes = config.style.classes.concat(" cdo-qtips");

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
    if (config.position.my === 'top right' || config.position.my === 'right top') {
      config.style.classes += ' flip-x-close';
    }

    if (callout.on) {
      $(window).on(callout.on, function () {
        if (!callout.seen && $(selector).length > 0) {
          callout.seen = true;
          $(selector).qtip(config).qtip('show');
        }
      });
    } else {
      $(selector).qtip(config).qtip('show');
    }
  });
};

/**
 * Snap all callouts to their target positions.  Keeps them in
 * position when blockspace is scrolled.
 */
function snapCalloutsToTargets() {
  var triggerEvent = null;
  var animate = false;
  $('.cdo-qtips').qtip('reposition', triggerEvent, animate);
}

/**
 * For callouts with targets in the codeWorkspace (blockly, flyout elements,
 * function editor elements, etc) hides callouts with targets that are
 * scrolled out of view, and shows them again when they are scrolled back in
 * to view.
 * @function
 */
var showOrHideCalloutsByTargetVisibility = (function () {
  // Close around this object, which we use to remember which callouts
  // were hidden by scrolling and should be shown again when they scroll
  // back in.
  /**
   * Remember callouts hidden due to overlap, keyed by qtip id
   * @type {Object.<string, boolean>}
   */
  var calloutsHiddenByScrolling = {};
  return function () {
    var codeWorkspace = $('#codeWorkspace');
    $('.cdo-qtips').each(function () {
      var api = $(this).qtip('api');
      var target = $(api.elements.target);

      var isTargetInCodeWorkspace = codeWorkspace.has(target).length > 0;
      if (!isTargetInCodeWorkspace) {
        return;
      }

      if (target && target.overlaps('#codeWorkspace').length > 0) {
        if (calloutsHiddenByScrolling[api.id]) {
          api.show();
          delete calloutsHiddenByScrolling[api.id];
        }
      } else {
        if ($(this).is(':visible')) {
          api.hide();
          calloutsHiddenByScrolling[api.id] = true;
        }
      }
    });
  };
})();

function reverseCallout(position) {
  position = position.split(/\s+/);
  return reverseDirection(position[0]) + ' ' + reverseDirection(position[1]);
}

function reverseDirection(token) {
  switch (token) {
    case 'left': return 'right';
    case 'right': return 'left';
    default: return token;
  }
}

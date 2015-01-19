// Sets up default options and initializes blockly
startTiming('Puzzle', script_path, '');
var onInitializeListeners = [];
var baseOptions = {
  containerId: 'blocklyApp',
  Dialog: Dialog,
  cdoSounds: CDOSounds,
  position: { blockYCoordinateInterval: 25 },
  onInitialize: function() {
    this.createCallouts();
    onInitializeListeners.forEach(function(listener) {
      listener();
    });
  },
  createCallouts: function() {
    $.fn.qtip.zindex = 500;
    this.callouts.every(function(callout) {
      var selector = callout.element_id; // jquery selector.
      if ($(selector).length === 0 && !callout.on) {
        return true;
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

      var customConfig = $.parseJSON(callout.qtip_config);
      var config = $.extend(true, {}, defaultConfig, customConfig);
      config.style.classes = config.style.classes.concat(" cdo-qtips");

      // Reverse callouts in RTL mode
      if (Blockly.RTL) {
        config.position.my = reverseCallout(config.position.my);
        config.position.at = reverseCallout(config.position.at);
        if (config.position.adjust) {
          config.position.adjust.x *= -1;
        }
      }

      if (callout.on) {
        window.addEventListener(callout.on, function() {
          if (!callout.seen && $(selector).length > 0) {
            callout.seen = true;
            $(selector).qtip(config).qtip('show');
          }
        });
      } else {
        $(selector).qtip(config).qtip('show');
      }

      return true;
    });
  },
  onAttempt: function(report) {
    report.fallbackResponse = appOptions.report.fallback_response;
    report.callback = appOptions.report.callback;
    // Track puzzle attempt event
    trackEvent('Puzzle', 'Attempt', script_path, report.pass ? 1 : 0);
    if (report.pass) {
      trackEvent('Puzzle', 'Success', script_path, report.attempt);
      stopTiming('Puzzle', script_path, '');
    }
    trackEvent('Activity', 'Lines of Code', script_path, report.lines);
    sendReport(report);
  },
  onResetPressed: function() {
    cancelReport();
  },
  onContinue: function() {
    if (lastServerResponse.videoInfo) {
      showVideoDialog(lastServerResponse.videoInfo);
    } else if (lastServerResponse.nextRedirect) {
      window.location.href = lastServerResponse.nextRedirect;
    }
  },
  backToPreviousLevel: function() {
    if (lastServerResponse.previousLevelRedirect) {
      window.location.href = lastServerResponse.previousLevelRedirect;
    }
  },
  showInstructionsWrapper: function(showInstructions) {
    var hasInstructions = appOptions.level.instructions || appOptions.level.aniGifURL;
    if (!hasInstructions || this.share || appOptions.level.skipInstructionsPopup) {
      return;
    }

    if (appOptions.autoplayVideo) {
      showVideoDialog(appOptions.autoplayVideo);
      $('.video-modal').on('hidden.bs.modal', function () {
        showInstructions();
      });
    } else {
      showInstructions();
    }
  },
};
$.extend(appOptions, baseOptions);

function reverseDirection(token) {
  if (/left/i.test(token)) {
    token = 'right';
  } else if (/right/i.test(token)) {
    token = 'left';
  }
  return token;
}
function reverseCallout(position) {
  position = position.split(/\s+/);
  var a = position[0];
  var b = position[1];
  return reverseDirection(a) + reverseDirection(b);
}
// Hide callouts when the function editor is closed (otherwise they jump to the top left corner)
$(window).on('function_editor_closed', function() {
  $('.cdo-qtips').qtip('hide');
});
// Turn string values into functions for keys that begin with 'fn_' (JSON can't contain function definitions)
// E.g. { fn_example: 'function () { return; }' } becomes { example: function () { return; } }
(function fixUpFunctions(node) {
  if (typeof node !== 'object') return;
  for (var i in node) {
    if (/^fn_/.test(i)) {
      try {
        node[i.replace(/^fn_/, '')] = eval('(' + node[i] + ')');
      } catch (e) { }
    } else {
      fixUpFunctions(node[i]);
    }
  }
})(appOptions.level);
window[appOptions.app + 'Main'](appOptions);

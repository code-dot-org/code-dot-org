var defaultOptions = {
  onAttempt: function(report) {
    report.fallbackResponse = appOptions.fallbackResponse;
    //report.callback = 'http://localhost:3000/milestone/2/1032';
    if (null) {
      $('#builder-error').text('');
      ['program', 'name', 'instructions', 'type'].forEach(function(key) {
        report['level[' + key + ']'] = report[key];
      });
      delete report.level;
      report.onComplete = function(response) {
        if(lastServerResponse.nextRedirect) {
          window.location.href = lastServerResponse.nextRedirect;
        } else {
          $('#builder-error').text(lastServerResponse.report_error);
        }
      };
    }
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
  Dialog: Dialog,
  showInstructionsWrapper: function(showInstructions) {
    var hasInstructions = appOptions.level.instructions || appOptions.level.aniGifURL;
    if (!hasInstructions || this.share || appOptions.level.skipInstructionsPopup) {
      return;
    }

    if ('') {
      $('.video-modal').on('hidden.bs.modal', function () {
        showInstructions();
      });
    } else {
      showInstructions();
    }
  },
  hide_source: false,
  share: false,
  no_padding: false,
  position: { blockYCoordinateInterval: 25 },
  cdoSounds: CDOSounds
}

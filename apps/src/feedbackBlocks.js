var FeedbackBlocks = function(options) {
  // Check whether blocks are embedded in the hint returned from dashboard.
  // See below comment for format.
  var embeddedBlocks = options.response && options.response.hint &&
      options.response.hint.indexOf("[{") !== 0;
  if (!embeddedBlocks &&
      options.feedbackType !==
      TestResults.MISSING_BLOCK_UNFINISHED &&
      options.feedbackType !==
      TestResults.MISSING_BLOCK_FINISHED) {
      return;
  }

  var blocksToDisplay = [];
  if (embeddedBlocks) {
    // Hint should be of the form: SOME TEXT [{..}, {..}, ..] IGNORED.
    // Example: 'Try the following block: [{"type": "maze_moveForward"}]'
    // Note that double quotes are required by the JSON parser.
    var parts = options.response.hint.match(/(.*)(\[.*\])/);
    if (!parts) {
      return;
    }
    options.response.hint = parts[1].trim();  // Remove blocks from hint.
    try {
      blocksToDisplay = JSON.parse(parts[2]);
    } catch(err) {
      // The blocks could not be parsed.  Ignore them.
      return;
    }
  } else {
    var missingRequiredBlocks = getMissingRequiredBlocks();
    blocksToDisplay = missingRequiredBlocks.blocksToDisplay;
    if (missingRequiredBlocks.message) {
      options.message = missingRequiredBlocks.message;
    }
  }

  if (blocksToDisplay.length === 0) {
    return;
  }

  this.div = document.createElement('div');
  this.html = readonly({
    app: options.app,
    assetUrl: studioAppSingleton.assetUrl,
    options: {
      readonly: true,
      locale: studioAppSingleton.LOCALE,
      localeDirection: studioAppSingleton.localeDirection(),
      baseUrl: studioAppSingleton.BASE_URL,
      cacheBust: studioAppSingleton.CACHE_BUST,
      skinId: options.skin,
      level: options.level,
      blocks: generateXMLForBlocks(blocksToDisplay)
    }
  });
  this.iframe = document.createElement('iframe');
  this.iframe.setAttribute('id', 'feedbackBlocks');
  this.iframe.setAttribute('allowtransparency', 'true');
  this.div.appendChild(this.iframe);
};

module.exports = FeedbackBlocks;

FeedbackBlocks.prototype.show = function() {
  var iframe = document.getElementById('feedbackBlocks');
  if (iframe) {
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(this.html);
    doc.close();
  }
};

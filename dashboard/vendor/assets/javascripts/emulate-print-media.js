/**
 * A script which can be included on any page to emulate what
 * the page would look like when rendering with @media=print.
 *
 * @see https://stackoverflow.com/a/24144530/1810460
 */
(function pretendToBeAPrinter() {
  // For looking up if something is in the media list
  function hasMedia(list, media) {
    if (!list) {
      return false;
    }

    var i = list.length;
    while (i--) {
      if (list[i] === media) {
        return true;
      }
    }
    return false;
  }

  // Loop though all stylesheets
  for (
    var styleSheetNo = 0;
    styleSheetNo < document.styleSheets.length;
    styleSheetNo++
  ) {
    // Current stylesheet
    var styleSheet = document.styleSheets[styleSheetNo];

    // Output debug information
    console.info("Stylesheet #" + styleSheetNo + ":");
    console.log(styleSheet);

    // First, check if any media queries have been defined on the <style> / <link> tag

    // Disable screen-only sheets
    if (
      hasMedia(styleSheet.media, "screen") &&
      !hasMedia(styleSheet.media, "print")
    ) {
      styleSheet.disabled = true;
    }

    // Display "print" stylesheets
    if (
      !hasMedia(styleSheet.media, "screen") &&
      hasMedia(styleSheet.media, "print")
    ) {
      // Add "screen" media to show on screen
      styleSheet.media.appendMedium("screen");
    }

    //  Get the CSS rules in a cross-browser compatible way
    var rules;
    try {
      rules = styleSheet.cssRules;
    } catch (error) {
      console.log(error);
    }

    try {
      rules = styleSheet.rules;
    } catch (error) {
      console.log(error);
    }

    //  Handle cases where styleSheet.rules is null
    if (!rules) {
      continue;
    }

    // Second, loop through all the rules in a stylesheet
    for (var ruleNo = 0; ruleNo < rules.length; ruleNo++) {
      // Current rule
      var rule = rules[ruleNo];

      // Hide screen-only rules
      if (hasMedia(rule.media, "screen") && !hasMedia(rule.media, "print")) {
        // Rule.disabled doesn't work here, so we remove the "screen" rule and add the "print" rule so it isn't shown
        console.info("Rule.media:");
        console.log(rule.media);
        rule.media.appendMedium(":not(screen)");
        rule.media.deleteMedium("screen");
        console.info("Rule.media after tampering:");
        console.log(rule.media);
      }

      // Display "print" rules
      if (!hasMedia(rule.media, "screen") && hasMedia(rule.media, "print")) {
        // Add "screen" media to show on screen
        rule.media.appendMedium("screen");
      }
    }
  }
})();

(function (root) {
  // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function replaceRule(text, rule, symbol) {
    // A rule longer than the text cannot match, and a very long pattern
    // makes RegExp throw "Regular expression too large" in browsers.
    if (rule === '' || rule.length > text.length) {
      return text;
    }
    return text.replace(new RegExp(escapeRegExp(rule), 'gi'), symbol);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {replaceRule: replaceRule};
  } else {
    root.TextCompression = {replaceRule: replaceRule};
  }
})(this);

/*global CodeMirror*/
$(function() {
  $('pre').each(function() {
    var preElement = $(this);
    var code = dedent(preElement.text()).trim();
    preElement.empty();
    CodeMirror(this, {
      value: code,
      mode: 'javascript',
      lineNumbers: !preElement.is('.inline'),
      readOnly: true
    });
  });

  $("a[href^='http']").attr("target", "_blank");
  rewrite_urls();
});

/**
 * Our x-frame-options require that any page that is embedded
 * in an iframe include embedded as a query arg.
 */
function rewrite_urls() {
  var is_embedded = window.location.href.endsWith("embedded");

  if (!is_embedded) {
    return;
  }

  $('a').each(function () {
    var a = this;
    var href = $(a).attr('href');
    if (href.startsWith("/applab/docs")) {
      var new_href = href;
      if (href.indexOf("?") > -1) {
        new_href += "&embedded";
      } else {
        new_href += "?embedded";
      }
      $(a).attr('href', new_href);
    }
  });
}

function getIndent(str) {
  var matches = str.match(/^[\s\\t]*/gm);
  var indent = matches[0].length;

  for (var i = 1; i < matches.length; i++) {
    indent = Math.min(matches[i].length, indent);
  }

  return indent;
}

function dedent(str, pattern) {
  var indent = getIndent(str);
  var reg;

  if (indent === 0) {
    return str;
  }

  if (typeof pattern === 'string') {
    reg = new RegExp('^' + pattern, 'gm');
  } else {
    reg = new RegExp('^[ \\t]{' + indent + '}', 'gm');
  }

  return str.replace(reg, '');
}

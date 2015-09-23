$(function() {
  $('pre').each(function() {
    var preElement = $(this);
    var code = dedent(preElement.html()).trim();
    preElement.empty();

    CodeMirror(this, {
      value: code,
      mode: 'javascript',
      lineNumbers: !preElement.is('.inline'),
      readOnly: true
    });
  });

  $("a[href^='http']").attr("target", "_blank");
});

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

  if (indent === 0) return str;

  if (typeof pattern === 'string') {
    reg = new RegExp('^' + pattern, 'gm');
  } else {
    reg = new RegExp('^[ \\t]{' + indent + '}', 'gm');
  }

  return str.replace(reg, '');
}

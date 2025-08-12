// Shared Accept-Language normalization used by multiple CloudFront Functions.
// Pure JS (no ERB). Provide language tags as the second argument.

var __acceptLanguageDefault = 'en';

function normalizeAcceptLanguage(request, langTags) {
  // Cookie override takes precedence
  var cookie = request.cookies && request.cookies.language_ ? request.cookies.language_.value : '';
  if (cookie) return cookie.toLowerCase();

  var hdr = request.headers && request.headers['accept-language'] ? request.headers['accept-language'].value : '';
  if (!hdr) return __acceptLanguageDefault;

  // Parse list of ranges with optional q-values, pick highest q
  var parts = hdr.split(',');
  var best = null, bestQ = -1;
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim();
    if (!p) continue;
    var segs = p.split(';');
    var lang = segs[0].toLowerCase();
    var q = 1.0;
    for (var j = 1; j < segs.length; j++) {
      var s = segs[j].trim();
      if (s.indexOf('q=') === 0) {
        var val = parseFloat(s.substring(2));
        if (!isNaN(val)) q = val;
      }
    }
    if (q > bestQ) { bestQ = q; best = lang; }
  }

  if (!best) return __acceptLanguageDefault;
  var primary = best.split('-')[0];
  if (langTags && langTags.indexOf && langTags.indexOf(primary) !== -1) return primary;
  // Fallback: try full tag then truncate progressively
  var range = best;
  var prev = null;
  while (range !== prev) {
    if (langTags && langTags.indexOf && langTags.indexOf(range) !== -1) return range;
    prev = range;
    range = range.replace(/-([a-z0-9]{1,8})$/i, '');
  }
  return __acceptLanguageDefault;
}




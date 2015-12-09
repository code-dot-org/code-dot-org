var eval_locale = {lc:{"en":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"it":function(n){return n===1?"one":"other"},"ar":function(n){
  if (n === 0) {
    return 'zero';
  }
  if (n == 1) {
    return 'one';
  }
  if (n == 2) {
    return 'two';
  }
  if ((n % 100) >= 3 && (n % 100) <= 10 && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 99 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){eval_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){eval_locale.c(d,k);return d[k] in p?p[d[k]]:(k=eval_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){eval_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).eval_locale = {
"badColorStringError":function(d){return "!!-You used an invalid color string: "+eval_locale.v(d,"val")+"-!!"},
"badStyleStringError":function(d){return "!!-You used an invalid style string: "+eval_locale.v(d,"val")+"-!!"},
"circleBlockTitle":function(d){return "!!-circle (radius, style, color)-!!"},
"displayBlockTitle":function(d){return "!!-evaluate-!!"},
"ellipseBlockTitle":function(d){return "!!-ellipse (width, height, style, color)-!!"},
"extraTopBlocks":function(d){return "!!-You have unattached blocks. Did you mean to attach these to the \"evaluate\" block?-!!"},
"infiniteRecursionError":function(d){return "!!-Your function is calling itself. We have stopped it, otherwise it would have continued calling itself forever.-!!"},
"overlayBlockTitle":function(d){return "!!-overlay (top, bottom)-!!"},
"placeImageBlockTitle":function(d){return "!!-place-image (x, y, image)-!!"},
"offsetBlockTitle":function(d){return "!!-offset (x, y, image)-!!"},
"rectangleBlockTitle":function(d){return "!!-rectangle (width, height, style, color)-!!"},
"reinfFeedbackMsg":function(d){return "!!-You can press the \""+eval_locale.v(d,"backButton")+"\" button to edit your program.-!!"},
"rotateImageBlockTitle":function(d){return "!!-rotate (degrees, image)-!!"},
"scaleImageBlockTitle":function(d){return "!!-scale (factor, image)-!!"},
"squareBlockTitle":function(d){return "!!-square (size, style, color)-!!"},
"starBlockTitle":function(d){return "!!-star (radius, style, color)-!!"},
"radialStarBlockTitle":function(d){return "!!-radial-star (points, inner, outer, style, color)-!!"},
"polygonBlockTitle":function(d){return "!!-polygon (sides, length, style, color)-!!"},
"stringAppendBlockTitle":function(d){return "!!-string-append (first, second)-!!"},
"stringLengthBlockTitle":function(d){return "!!-string-length (string)-!!"},
"textBlockTitle":function(d){return "!!-text (string, size, color)-!!"},
"triangleBlockTitle":function(d){return "!!-triangle (size, style, color)-!!"},
"underlayBlockTitle":function(d){return "!!-underlay (bottom, top)-!!"},
"outline":function(d){return "!!-outline-!!"},
"solid":function(d){return "!!-solid-!!"},
"string":function(d){return "!!-string-!!"},
"stringMismatchError":function(d){return "!!-You have a string with the wrong capitalization.-!!"},
"userCodeException":function(d){return "!!-An error occurred while executing your code.-!!"},
"wrongBooleanError":function(d){return "!!-Your blocks evaluate to the wrong boolean value.-!!"}};
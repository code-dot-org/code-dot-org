var calc_locale = {lc:{"en":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"it":function(n){return n===1?"one":"other"},"ar":function(n){
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
v:function(d,k){calc_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){calc_locale.c(d,k);return d[k] in p?p[d[k]]:(k=calc_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){calc_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).calc_locale = {
"divideByZeroError":function(d){return "!!-Your program results in division by zero.-!!"},
"emptyComputeBlock":function(d){return "!!-You must attach a block to the \"evaluate\" block.-!!"},
"equivalentExpression":function(d){return "!!-Try reordering your arguments to get exactly the same expression.-!!"},
"evaluate":function(d){return "!!-evaluate-!!"},
"extraTopBlocks":function(d){return "!!-You have unattached blocks. Did you mean to attach these to the \"evaluate\" block?-!!"},
"failedInput":function(d){return "!!-Your function does not return the right result for all values.-!!"},
"goal":function(d){return "!!-Goal:-!!"},
"levelIncompleteError":function(d){return "!!-Your expression does not match the goal.-!!"},
"missingFunctionError":function(d){return "!!-You must define a function named "+calc_locale.v(d,"functionName")+".-!!"},
"missingVariableX":function(d){return "!!-Your expression is missing variable "+calc_locale.v(d,"var")+".-!!"},
"reinfFeedbackMsg":function(d){return "!!-Here is your calculation! Continue working on it, or move on to the next puzzle!-!!"},
"yourExpression":function(d){return "!!-Your expression:-!!"},
"wrongInput":function(d){return "!!-You are calling your function with the wrong value.-!!"},
"wrongOtherValuesX":function(d){return "!!-Your expression results in the wrong value if we vary "+calc_locale.v(d,"var")+".-!!"},
"wrongResult":function(d){return "!!-Your expression does not return the correct result.-!!"}};
(function(){
  var ref$, filter, map, objToPairs, Str, cancelEvent, classNameFromObject, out$ = typeof exports != 'undefined' && exports || this;
  ref$ = require('prelude-ls'), filter = ref$.filter, map = ref$.map, objToPairs = ref$.objToPairs, Str = ref$.Str;
  out$.cancelEvent = cancelEvent = function(e){
    e.preventDefault();
    e.stopPropagation();
    false;
  };
  out$.classNameFromObject = classNameFromObject = function(it){
    var this$ = this;
    return Str.join(' ')(
    map(function(it){
      return it[0];
    })(
    filter(function(it){
      return !!it[1];
    })(
    objToPairs(
    it))));
  };
}).call(this);

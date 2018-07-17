function whenTouchingAny(sprite, group, event) {
  var g = group();
  function f(s) { 
    collisionEvents.push(
      {a: sprite, 
       b: function() { return s; }, 
       event: event});
  }
  for (var i=0;i<g.length;i++) {
    var gg = g[i];
	f(gg);
  }
}
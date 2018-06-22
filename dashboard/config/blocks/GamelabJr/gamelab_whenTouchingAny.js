function whenTouchingAny(sprite, group, event) {
  var g = group();
  for (var i=0;i<g.length;i++) {
      if (_DEBUG_) { console.log(g[i]); }
	collisionEvents.push({a: sprite, b: g[i] , event: event});
  }
}
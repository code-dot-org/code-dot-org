function jumpTo(sprite,location) {
  var loc;
  if(typeof location === "function") {
    if(!Array.isArray(sprite)) {
      loc = location();
      sprite.x = loc.x;
      sprite.y = loc.y;
    } else {
      sprite.forEach(function(s) {
      	loc = location();
        s.x = loc.x;
        s.y = loc.y;
      });
    }
  } else {
    if(!Array.isArray(sprite)) {
  	  sprite.x = location.x;
      sprite.y = location.y;
    } else {
  	  sprite.forEach(function(s){
      s.x = location.x;
      s.y = location.y;
    });
  }
 }
}
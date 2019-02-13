function removeOneAndAll(sprite) {
  if(sprite) {
    if(!Array.isArray(sprite)) {
    	sprite.remove();
    } else {
        while(sprite.length > 0) {
          sprite[0].remove();
          sprite.shift();
        }
    }
  }
}
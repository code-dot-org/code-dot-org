function removeOneAndAll(sprite) {
  if(sprite) {
    if(!Array.isArray(sprite)) {
    	sprite.destroy();
    } else {
        while(sprite.length > 0) {
          sprite[0].remove();
          sprite.shift();
        }
    }
  }
}
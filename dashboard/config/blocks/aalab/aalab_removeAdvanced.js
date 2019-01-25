function removeAdvanced(sprite) {
  if(sprite) {
    if(sprite.length === undefined) {
    	sprite.destroy();
    } else {
        while(spriteGroups[sprite.name].size() > 0) {
          spriteGroups[sprite.name][0].remove();
        }
      delete spriteGroups[sprite.name];
    }
  }
}
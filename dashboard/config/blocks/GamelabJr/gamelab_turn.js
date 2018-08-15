function turn(sprite,n,direction) {
  if (!sprite || n === undefined) {
    return;
  }
  if (direction=="right") {
    sprite.rotation+=n;
  }
  else {
    sprite.rotation-=n;
  }
}

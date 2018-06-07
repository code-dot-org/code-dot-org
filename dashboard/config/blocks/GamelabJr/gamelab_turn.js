function turn(sprite,n,direction) {
  if (direction=="right") {
    sprite.rotation+=n;
  }
  else {
    sprite.rotation-=n;
  }
}

function playerJump(strength) {
  if (
    getVelocity(({group: "players"}), "velocityX")<=0 &&
    isDirectlyAbove({group: "players"}, {group: "walls"})
  ) {
    setVelocity(({group: "players"}), "velocityY", strength);
  }
}
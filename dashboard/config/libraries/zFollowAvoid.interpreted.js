function startFollowing(sprites,targets){
  addTarget(sprites, targets);
  addBehaviorSimple(sprites, followingTargets());
}

function stopFollowing(sprites){
  removeBehaviorSimple(sprites, followingTargets());
}

other.push(startFollowing);
other.push(stopFollowing);
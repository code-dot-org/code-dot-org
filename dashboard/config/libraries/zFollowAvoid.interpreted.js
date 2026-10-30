// Experimental library, unused in published levels
// Can be demoed in level: avoid_follow

function startFollowing(sprites,targets){
  addTarget(sprites, targets, "follow");
  addBehaviorSimple(sprites, followingTargets());
}

function stopFollowing(sprites){
  removeBehaviorSimple(sprites, followingTargets());
}

other.push(startFollowing);
other.push(stopFollowing);
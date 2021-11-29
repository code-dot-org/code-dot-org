function contagionRecover(){
  recoveryTime = 200;
  addBehaviorSimple(({costume: "sick"}), new Behavior(contagionRecovering, []));
  addBehaviorSimple(({costume: "sick_mask"}), new Behavior(contagionRecovering, []));
  //addBehaviorSimple(({costume: "all"}), new Behavior(contagionWandering, []));
}

function contagionRecovering(this_sprite) {
  if (!getProp(this_sprite, "recovery")) {
    setProp(this_sprite, "recovery", 0);
  }
  changePropBy(this_sprite, "recovery", 1);
  if (getProp(this_sprite, "recovery") >= recoveryTime) {
    setProp(this_sprite, "recovery", 0);
    if (isCostumeEqual(this_sprite, "sick")) {
      setAnimation(this_sprite, "healthy");
    } else if (isCostumeEqual(this_sprite, "sick_mask")) {
      setAnimation(this_sprite, "healthy_mask");
    }
    removeBehaviorSimple(this_sprite, new Behavior(recovering, []));
  }
}

function contagionWandering(this_sprite) {
  if (math_random_int(0, 5) == 0) {
    changePropBy(this_sprite, "direction", math_random_int(-25, 25));
  }
  moveForward(this_sprite, 1);
  if (isTouchingEdges(this_sprite)) {
    edgesDisplace(this_sprite);
    changePropBy(this_sprite, "direction", math_random_int(135, 225));
  }
}

function recoveryBars(){
  //Declare helper variables
  var spriteIds = getSpriteIdsInUse();

  for (var i = 0; i < spriteIds.length; i++) {
    if (getProp({id: spriteIds[i]}, "costume") == "sick" || getProp({id: spriteIds[i]}, "costume") == "sick_mask") {
      var spriteX=getProp({id: spriteIds[i]}, "x");
      var spriteY=400-getProp({id: spriteIds[i]}, "y");
      var spriteScale=getProp({id: spriteIds[i]}, "scale");
      var spriteRecovery=getProp({id: spriteIds[i]}, "recovery");
      if (spriteRecovery===0){
        spriteRecovery=recoveryTime;
      }
      if(spriteRecovery){
        push();
        stroke("white");
        stroke("black");
        strokeWeight(1);
        fill("#dd228e");
        fill("white");
        rect(spriteX-(spriteScale/4),spriteY-(spriteScale/2)-10, 1+spriteScale/2,5);
        fill("#8e7cc4");
        fill("#49fb35");
        rect(spriteX-(spriteScale/4),spriteY-(spriteScale/2)-10, 1+spriteScale*spriteRecovery/(recoveryTime*2),5);
        pop();
      }
    }
  }
}

other.push(contagionRecover);

other.push(recoveryBars);
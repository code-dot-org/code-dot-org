function stopBehavior(image, behavior){
  if(behavior=="all"){
    removeAllBehaviors(({costume: image}));
  } else {
    removeBehaviorSimple(({costume: image}), new Behavior(behavior, []));
  }
}
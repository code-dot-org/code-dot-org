function startBehavior(image, behavior){
  addBehaviorSimple(({costume: image}), new Behavior(behavior, []));

}
function oceanSetup() {
  setBackgroundImageAs("background_underwater_17");
  makeNewSpriteAnon("boat-net", ({"x":57,"y":45}));
  setProp(({costume: "boat-net"}), "scale", 200);
  makeNewSpriteAnon("underseadeco_24", ({"x":43,"y":358}));
  makeNewSpriteAnon("underseadeco_25", ({"x":110,"y":371}));
  addBehaviorSimple(({costume: "boat-net"}), new Behavior(moving_east_and_looping, []));
  makeNumSprites(7, "green-sea-plant-2");
  setProp(({costume: "green-sea-plant-2"}), "scale", 30);
}
oceanSetup();
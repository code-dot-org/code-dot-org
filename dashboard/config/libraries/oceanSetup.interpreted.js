function oceanSetup() {
setBackgroundImageAs("background_underwater_17");
makeNewSpriteAnon("boat-net", ({"x":57,"y":45}));
setProp(({costume: "boat-net"}), "scale", 200);
addBehaviorSimple(({costume: "boat-net"}), new Behavior(moving_east_and_looping, []));
makeNewSpriteAnon("underseadeco_25", ({"x":110,"y":371}));
makeNewSpriteAnon("underseadeco_24", ({"x":43,"y":358}));
makeNumSprites(10, "green-sea-plant-2");
setProp(({costume: "green-sea-plant-2"}), "scale", 30);
makeNumSprites(10, "fish_10");
setProp(({costume: "fish_10"}), "scale", 30);
addBehaviorSimple(({costume: "fish_10"}), new Behavior(wandering, []));
}
oceanSetup();
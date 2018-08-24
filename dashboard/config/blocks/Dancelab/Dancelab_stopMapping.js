function stopMapping(sprite, property, range) {
  var behavior = new Behavior(function(sprite) {
    var energy = Dance.fft.getEnergy(range);
    if (property == "x") {
      energy = Math.round(map(energy, 0, 255, 50, 350));
    } else if (property == "y") {
      energy = Math.round(map(energy, 0, 255, 350, 50));
    } else if (property == "size") {
      energy = map(energy, 0, 255, 0, 2);
    } else if (property == "rotation" || property == "direction") {
      energy = Math.round(map(energy, 0, 255, -180, 180));
    } else if (property == "tint") {
      energy = Math.round(map(energy, 0, 255, 0, 360));
      energy = "hsb(" + energy + ",100%,100%)";
    }
    console.log(property + " " + energy);
    sprite[property] = energy;
  }, [property, range]);
  behavior.func.name = "mapping" + property + range;
  removeBehavior(sprite, behavior);
}
function mappingProp(property, range) {
  var behavior = new Behavior(function(sprite, property, range) {
    var energy = Dance.fft.getEnergy(range);
    if (property == "x") {
      energy = Math.round(map(energy, 0, 255, 50, 350));
    } else if (property == "y") {
      energy = Math.round(map(energy, 0, 255, 350, 50));
    } else if (property == "scale") {
      energy = map(energy, 0, 255, 0, 2);
    } else if (property == "rotation" || property == "direction") {
      energy = Math.round(map(energy, 0, 255, 0, 360));
    } else if (property == "tint") {
      energy = Math.round(map(energy, 0, 255, 0, 360));
      energy = "hsb(" + energy + ",100%,100%)";
    }
    sprite[property] = energy;
  }, [property, range]);
  return behavior;
}
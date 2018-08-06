function mapXvol2(sprite) {
  var behavior = function(sprite){
  	sprite.x = Dance.fft.getEnergy.apply(20, 4000);
  };
  behavior.name = "mapXvol2";
  return behavior;
}
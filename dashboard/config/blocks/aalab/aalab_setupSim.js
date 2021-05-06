function setupSim(count){
  makeNumSprites(count, "healthy");
  setProp(({costume: "all"}), "scale", 25);
  setProp(({costume: "all"}), "debug", false);
  
  World.allSprites.displace(World.allSprites);
  World.allSprites.displace(World.allSprites);
}
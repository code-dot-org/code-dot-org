function setupSim(count){
  makeNumSprites(count, "healthy");
  setProp(({costume: "all"}), "scale", 15);
  setProp(({costume: "all"}), "debug", true);
  
  World.allSprites.displace(World.allSprites);
  World.allSprites.displace(World.allSprites);
}
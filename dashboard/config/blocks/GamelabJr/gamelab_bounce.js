function bounce(sprite){
  if(sprite.isTouching(edges)){
    console.log("touched");
  }
  edges.displace(sprite);
  console.log(sprite.touching);
  sprite.direction += sprite.direction * 1.45;
}
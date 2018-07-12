
function bounce(sprite){
  if(sprite.isTouching(leftEdge)){
    console.log("touched left");
  }
  else if(sprite.isTouching(rightEdge)){
    console.log("touched right");
  }
  else if(sprite.isTouching(topEdge)){
    console.log("touched top");
  }
  edges.displace(sprite);
  sprite.direction += sprite.direction * 1.45;
}
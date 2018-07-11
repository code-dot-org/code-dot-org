function bounce(sprite){
  if(sprite.isTouching(bottomEdge)){
    console.log("bottom!");
  }
  else if(sprite.isTouching(rightEdge)){
    console.log("Right!");
  }
  else if(sprite.isTouching(topEdge)){
    console.log("Top!");
  }
  else{
     console.log("Left");
  } 
  console.log(sprite.touching);
  sprite.direction += sprite.direction * 1.45;
}
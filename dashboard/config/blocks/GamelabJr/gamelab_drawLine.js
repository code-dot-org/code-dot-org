function drawLine(color, point1, point2){
  if(!color){color="black";}
  if(!point1){point1={x:200,y:200};}
  if(!point2){point2={x:200,y:200};}
  push();
  stroke(color);
  strokeWeight(5);
  line(point1.x,point1.y,point2.x,point2.y);
  pop();
}
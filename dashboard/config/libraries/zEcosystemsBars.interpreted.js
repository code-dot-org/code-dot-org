function propBars(){
  //Declare helper variables
  var spriteIds = getSpriteIdsInUse();
  var valueMax = 1000;

  for (var i = 0; i < spriteIds.length; i++) {
    var spriteX=getProp({id: spriteIds[i]}, "x");
    var spriteY=400-getProp({id: spriteIds[i]}, "y");
    var spriteScale=getProp({id: spriteIds[i]}, "scale");
    if(!getProp({id: spriteIds[i]}, "energy")){
      setProp(({id: spriteIds[i]}), "energy", valueMax/2);
    } else
    if(getProp({id: spriteIds[i]}, "energy")>valueMax){
      setProp(({id: spriteIds[i]}), "energy", valueMax);
    } else
    if(getProp({id: spriteIds[i]}, "energy")<0){
      setProp(({id: spriteIds[i]}), "energy", 0);
    }
      var spriteValue=getProp({id: spriteIds[i]}, "energy")+1;

      if(spriteValue){
        push();
        stroke("white");
        stroke("black");
        strokeWeight(1);
        fill("#dd228e");
        fill("white");
        rect(spriteX-(spriteScale/4),spriteY-(spriteScale/2)-10, 1+spriteScale/2,5);
        fill("#8e7cc4");
        fill("#49fb35");
        rect(spriteX-(spriteScale/4),spriteY-(spriteScale/2)-10, 1+spriteScale*spriteValue/(valueMax*2),5);
        pop();
      }
    }
  //}
}

other.push(propBars);
var studentVarToken = false;
var varLog={};
if(!validationProps){
  var validationProps ={};
}

function updateLog(){
  var start = Object.keys(window).indexOf("playSoundOptions")+1;
  var end = Object.keys(window).indexOf("math_random_int");
  var index;
  for(var i=start;i<end;i++){
    if(window[Object.keys(window)[i]] != undefined){
      varLog[Object.keys(window)[i]] = window[Object.keys(window)[i]];
    }
  }
  varWatchers(varLog);
  
  if(validationProps){//is Sprite Lab
    if(!validationProps.previous){
      validationProps.previous = {};
    }
    detectVarChange();
    validationProps.previous.varLog=JSON.parse(JSON.stringify(varLog));
  }
  
}

function varWatchers(varLog){
  for(var key in varLog){
    var index = Object.keys(varLog).indexOf(key);
    var x = 5;
    var y = 32;
    watcher(key, varLog[key], index, x, y);
  }
}

function watcher(label, value, index, x, y){
  if(!value&&value!=0&&value!=''){
    value = 'undefined';
  }
  //rect(fontSize/2,fontSize/2+index*fontSize*2);
  var fontSize=15;
  textSize(fontSize);
  textAlign(LEFT,CENTER);
  labelX = x + 5;
  valueX = x + 15 + textWidth(label);
  textY = y + (index+0.5) * fontSize*2;
  stroke("#c6cacd");
  fill("#e7e8ea");
  rect(x,y + index * fontSize*2,textWidth(label)+textWidth(value)+25,fontSize*2, fontSize/2);
  noStroke();
  fill("#5b6770");
  text(label,labelX,textY);
  fill("#ffa400");
  rect(valueX - 5,y + (index+0.125) * fontSize*2,textWidth(value)+10,fontSize*1.5, fontSize/1.5);
  noStroke();
  fill("white");
  text(value,valueX,textY);
}

function detectVarChange(){
  if(validationProps.previous.varLog){
    if(JSON.stringify(validationProps.previous.varLog) != JSON.stringify(varLog)){
      /*for (var key in validationProps.previous.varLog){
        if(validationProps.previous.varLog[key]!=window[key]){
          //console.log("["+ World.frameCount + "]: " + key + " changed from " + validationProps.previous.varLog[key] + " to " + window[key]);
        }
      }*/
      return true;
    }
  }
  return false;
}

other.push(updateLog);
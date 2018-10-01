
//Setup the world and constants
var world = [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0];
var agent ={x:0,y:0,dir:0};
var cellSize=100;

///////////////////////////////////////////////
////Block functions                         ///
////Each function contains the full         ///
////implementation of the code for a block  ///
///////////////////////////////////////////////

function moveForward() {
  switch (agent.dir) {
    case 0:
      agent.x+=1;
      break;
    case 1:
      agent.y+=1;
      break;
    case 2:
      agent.x-=1;
      break;
    case 3:
      agent.y-=1;
      break;
  }
}
function turnRight() {
  agent.dir=(agent.dir+1)%4;
}
function turnLeft() {
  agent.dir=((agent.dir-1)+4)%4;
}
  
function readSound() {
  console.log(world[agent.y*4+agent.x]);
  if (world[agent.y*4+agent.x]) {
    playSound("sound://category_instrumental/sax_upscale_1.mp3",false);
  }
  else {
    playSound("sound://category_instrumental/sax_downscale_1.mp3",false);
  }
}

function readToConsole() {
  console.log(world[agent.y*4+agent.x]);
}

///////////////////////////////////////////
////Library code to manage the world   ////
///////////////////////////////////////////

function drawAgent() {
  fill("red");
  regularPolygon(agent.x*cellSize+cellSize/2, agent.y*cellSize+cellSize/2, 3, cellSize/2);
}


function drawWorld() {
    for (var i = 0; i < 4; i++) {
    for (var j = 0;j<4;j++) {
      if (world[i*4+j])
        fill("white");
      else
        fill("black");
      rect(j*cellSize, i*cellSize, cellSize, cellSize);
    }
  }
}

function draw() {
    drawWorld();
    drawAgent();
}


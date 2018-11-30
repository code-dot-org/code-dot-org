var grid = [];
var turtle = {};
var moveQueue = [];
setup();

// BAKER IDEA:
// CLONE turtle on every move, or maybe just pos/heading
// Add into a queue, along with line that's executing at the moment

///////////// STUDENT CODE HERE ///////























/////////// IGNORE BELOW THIS LINE

// timedLoop(DELAY, function() {
//     if(moveQueue.length>0){
//       var t = moveQueue.shift(); //JS for remove from front
//       moveTo(t.col*50+25+30, t.row*50+25+30);
//       turnTo(t.heading*90);
//       penDown();
//       penColor("red");
//     }
// });

function CAN_MOVE(dir){
    return turtle.canMove(dir);
}

function MOVE_FORWARD(){
    turtle.move();
}

function ROTATE_LEFT(){
    turtle.left();
}
function ROTATE_RIGHT(){

    turtle.right();
}


function setup(){
  speed(100);
  createCanvas("canvas1",260,255);
  setProperty("canvas1","x",30);
  setProperty("canvas1","y",30);
  //setActiveCanvas("canvas1");

  
  grid[0]=[0,0,1,0,0];
  grid[1]=[0,0,1,0,0];
  grid[2]=[0,0,1,1,0];
  grid[3]=[0,1,1,0,0];
  grid[4]=[1,0,1,0,0];

  setupGrid(grid);
  setupTurtle();  //should change to object instantiation
  
  penUp();
  turtle.setTurtlePos();
  penDown();
  penColor("red");
  //speed(75);
  
 
}

function setupGrid(grid){

  // grid[0]=[0,0,1,0,0];
  // grid[1]=[0,0,1,0,0];
  // grid[2]=[0,0,1,1,0];
  // grid[3]=[0,1,1,0,0];
  // grid[4]=[1,0,1,0,0];
  

  
  for(var row=0; row<5; row++){
    for(var col=0; col<5; col++){
      setFillColor("white");
      if(grid[row][col]==1){
        setFillColor("black");
      }
      rect(col*50, row*50, 50,50);
    }
  }
}

function setupTurtle(){

  turtle.row = 0;
  turtle.col= 0;
  turtle.heading = 1; // 0=N, 1=E, 2=S, 3=W
  
  turtle.right = function(){
    
    this.heading = (this.heading+1)%4;
      this.setTurtlePos();
  
  };
  
  turtle.left = function(){
    this.heading = (this.heading+3)%4;
    this.setTurtlePos();
  
  };
  
  turtle.canMove = function(dir){
    var loc = this.getLocationInDirection(dir);
    return isValidGridLoc(loc);
  };
  
  
  // assume dir == "left" || "fwd" || "right"
  turtle.getLocationInDirection=function(dir){
    
    var degs = 0;
    if(dir=="left") degs=3;
    else if(dir=="right") degs=1;
    
    var newHeading = (this.heading+degs)%4;
    
    if(newHeading==0){
      return {row:this.row-1, col:this.col};
    }
    else if(newHeading==1){
      return {row:this.row, col:this.col+1};
    }
    else if(newHeading==2){
      return {row:this.row+1, col:this.col};
    }
    else{ //heading is 3
      return {row:this.row, col:this.col-1};
    }
    
  };
  turtle.move = function(){
  
    if(this.heading==0){
        this.row -= 1;
    }
    else if(this.heading==1){
        this.col += 1;
    }
    else if(this.heading==2){
        this.row += 1;
    }
    else{
        this.col -= 1;
    }
    this.setTurtlePos();
    
  };

  turtle.setTurtlePos = function(){

   var turtleState = {col:this.col, row:this.row, heading:this.heading};
   // Object.assign(turtleState, turtle); // deep copy of turtle
    //moveQueue.push(turtleState);
    moveTo(this.col*50+25+30, this.row*50+25+30);
    turnTo(this.heading*90);
  };

}



function isValidGridLoc(loc){
  console.log("Checking "+JSON.stringify(loc));
  if(loc.row<0) return false;
  if(loc.row>grid.length) return false;
  if(loc.col<0) return false;
  if(loc.col > grid[0].length) return false;
  
  return grid[loc.row][loc.col]==0;
  
}



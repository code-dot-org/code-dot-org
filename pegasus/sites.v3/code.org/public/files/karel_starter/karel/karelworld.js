function KarelWorld(rows, cols){
    this.rows = rows;
    this.cols = cols;
    
    this.grid = new Grid(rows, cols);
    this.karel = null;
    
    this.walls = new Set();
    this.beeperList = [];
    this.reset();
}

KarelWorld.BUFFER_SIZE = 3;

KarelWorld.prototype.facingNorth = function(){
    return this.karelDir == Karel.NORTH;
}

KarelWorld.prototype.facingSouth = function(){
    return this.karelDir == Karel.SOUTH;
}

KarelWorld.prototype.facingEast = function(){
    return this.karelDir == Karel.EAST;
}

KarelWorld.prototype.facingWest = function(){
    return this.karelDir == Karel.WEST;
}

KarelWorld.prototype.frontIsClear = function(){
    return this.canMove();
}

KarelWorld.prototype.rightIsClear = function(){
    var rightDir = this.karelDir + Karel.NUM_DIRS - 1;
    rightDir = rightDir % Karel.NUM_DIRS;
    return this.canMove(rightDir);    
}

KarelWorld.prototype.leftIsClear = function(){
    var leftDir = this.karelDir + 1;
    leftDir = leftDir % Karel.NUM_DIRS;
    return this.canMove(leftDir);
}


KarelWorld.prototype.setKarelDir = function(dir){
    this.karelStartDir = dir;
    this.karelDir = dir;
}


KarelWorld.prototype.createWalls = function(walls){
    if (walls == undefined) return;
    for(var i = 0; i < walls.length; i++){
        var cur = walls[i];
        var wall = new Wall({row: cur[0], col: cur[1]},
                            {row: cur[2], col: cur[3]});
        this.walls.add(wall);
    }
}

KarelWorld.prototype.setupBeepers = function(beepers){
    if(typeof beepers != "undefined"){
        this.beeperList = beepers;
    }
    for(var i = 0; i < this.beeperList.length; i++){
        var cur = this.beeperList[i];
        this.setBeepers(cur[0], cur[1], cur[2]);
    }
}

/* Reset to the initial state */
KarelWorld.prototype.reset = function(){
    this.karelRow = this.karelStartRow;
    this.karelCol = this.karelStartCol;
    this.karelDir = this.karelStartDir;
    
    for(var i = 0; i < this.grid.numRows(); i++){
        for(var j = 0; j < this.grid.numCols(); j++){
            this.grid.set(i, j, 0);
        }
    }
    this.setupBeepers();
    
    this.draw();
}

KarelWorld.prototype.move = function(){
    switch(this.karelDir){
        case Karel.EAST:
            this.karelCol++;
            break;
        case Karel.WEST:
            this.karelCol--;
            break;
        case Karel.SOUTH:
            this.karelRow--;
            break;
        case Karel.NORTH:
            this.karelRow++;
        default:
            break;
    }
}


KarelWorld.prototype.setBeepers = function(row, col, numBeepers){
    this.grid.set(row, col, numBeepers);
}

KarelWorld.prototype.getBeepers = function(){
    return this.grid.get(this.karelRow, this.karelCol);
}

KarelWorld.prototype.ballsPresent = function(){
    var beepers = this.getBeepers();
    return beepers > 0;
}

KarelWorld.prototype.putBall = function(){
    var curBeepers = this.grid.get(this.karelRow, this.karelCol);
    this.grid.set(this.karelRow, this.karelCol, curBeepers + 1);
}

KarelWorld.prototype.takeBall = function(){
    var curBeepers = this.grid.get(this.karelRow, this.karelCol);
    this.grid.set(this.karelRow, this.karelCol, curBeepers - 1);
}

KarelWorld.prototype.turnLeft = function(){
    this.karelDir = this.karelDir + 1;
    this.karelDir = this.karelDir % Karel.NUM_DIRS;
}

KarelWorld.prototype.turnRight = function(){
    this.karelDir = this.karelDir + Karel.NUM_DIRS - 1;
    this.karelDir = this.karelDir % Karel.NUM_DIRS;
}

KarelWorld.prototype.turnAround = function(){
    this.karelDir = this.karelDir + 2;
    this.karelDir = this.karelDir % Karel.NUM_DIRS;
}


KarelWorld.prototype.animate = function(command){
    if(command == Karel.MOVE){
        this.move();
    }
    if(command == Karel.TURN_LEFT){
        this.turnLeft();
    }
    if(command == Karel.TURN_RIGHT){
        
        this.turnRight();
    }
    if(command == Karel.TURN_AROUND){
        this.turnAround();
    }
    if(command == Karel.PUT_BEEPER){
        this.putBall();
    }
    if(command == Karel.PICK_BEEPER){
        this.takeBall();
    }

    this.draw();
}

KarelWorld.prototype.getNextPosition = function(curPos, dir){
    var next = {row: curPos.row, col: curPos.col};
    
    if(typeof dir == "undefined"){
        dir = this.karelDir;
    }
    
    if(dir == Karel.NORTH) next.row = next.row + 1;
    if(dir == Karel.SOUTH) next.row = next.row - 1;
    
    if(dir == Karel.EAST) next.col = next.col + 1;
    if(dir == Karel.WEST) next.col = next.col - 1;
    
    return next;
}

/* Test if karel can move in the given direction by getting the next
   position in the direction and seeing if there is a wall between
   our current spot and that next location */
KarelWorld.prototype.canMove = function(dir){
    var curPos = {row: this.karelRow, col: this.karelCol};
    var nextPos = this.getNextPosition(curPos, dir);
    
    if(nextPos.row < 0 || nextPos.row >= this.rows || 
       nextPos.col < 0 || nextPos.col >= this.cols) return false;
       
    var wall = new Wall(curPos, nextPos);
    
    if(this.walls.contains(wall)) return false;
        
    return true;
}

KarelWorld.prototype.setKarelLocation = function(row, col){
    this.karelStartRow = row;
    this.karelStartCol = col;
    this.karelRow = row;
    this.karelCol = col;
}

KarelWorld.prototype.drawWall = function(wall){
    var first = wall.getFirst();
    var second = wall.getSecond();
    var pos = this.getCornerPos(first.row, first.col, this.dim);

    var line;

    if(wall.orientation == Wall.VERTICAL){
        var start = {x: pos.x + this.dim/2, y: pos.y - this.dim/2};
        line = new Line(start.x, start.y, start.x, start.y + this.dim); 
    }else{
        var start = {x: pos.x - this.dim/2, y: pos.y - this.dim/2};
        line = new Line(start.x, start.y, start.x + this.dim, start.y);         
    }
    add(line);
}

KarelWorld.prototype.drawWalls = function(){
    var walls = this.walls.elems();
    for(var elem in walls){
        var wall = walls[elem];
        this.drawWall(wall);
    }
}

KarelWorld.prototype.draw = function(){
    removeAll();
    var dim = Math.min(getWidth()/this.cols, getHeight()/this.rows);
    this.dim = dim;
    
    this.drawWalls();
    
    for(var i = 0; i < this.rows; i++){
        for(var j = 0; j < this.cols; j++){
            this.drawCorner(i, j, dim);
        }
    }
    
    var karelPos = this.getCornerPos(this.karelRow, this.karelCol, dim);
    this.drawKarel(karelPos);    
}

KarelWorld.prototype.drawBeepers = function(karelPos, numBeepers){
    if(numBeepers > 0){
        var beeper = new Circle(this.dim/2 - KarelWorld.BUFFER_SIZE);
        beeper.setColor(Color.YELLOW);
        beeper.setPosition(karelPos.x, karelPos.y);
        //var beeper = new Beeper(karelPos.x, karelPos.y, this.dim);
        add(beeper);
        
        if(numBeepers > 1){
            var count = new Text(numBeepers);
            count.setFont('10pt Arial');
            count.setPosition(karelPos.x - count.getWidth()/2, karelPos.y + count.getHeight()/2);
            add(count);
        }
    }
}

KarelWorld.prototype.drawKarel = function(karelPos){
    var x = karelPos.x - this.dim/2;
    var y = karelPos.y - this.dim/2;
        
    if(this.karelDir == Karel.EAST){
        this.karel = Karel.EAST_IMAGE;
    }else if(this.karelDir == Karel.NORTH){
        this.karel = Karel.NORTH_IMAGE;
    }else if(this.karelDir == Karel.WEST){
        this.karel = Karel.WEST_IMAGE;
    }else{
        this.karel = Karel.SOUTH_IMAGE;        
    }
    
    //this.karel.setSize(this.dim - KarelWorld.BUFFER_SIZE, this.dim - KarelWorld.BUFFER_SIZE);
    
    this.karel.setPosition(x, y);
    add(this.karel);
    
    //this.karel = new KarelRobot(x, y, this.dim, this.karelDir);
    //add(this.karel);
}

/* Return the x, y coordinate of this karel row and column for the given
   dimension. Row 0 is at the greatest y position, and column 0 is at the
   smallest x position. We return the coordinate of the center of the
   square */
KarelWorld.prototype.getCornerPos = function(row, col, dim){
    var x = (col + 0.5) * dim;
    var y = (this.rows - 1 - row + 0.5) * dim;
    return {
        x: x,
        y: y
    };
}

KarelWorld.prototype.drawCorner = function(row, col, dim){
    var numBeepers = this.grid.get(row, col);
    var pos = this.getCornerPos(row, col, dim);
    
    if(numBeepers == 0){
        var circle = new Circle(2);
        circle.setPosition(pos.x, pos.y);
        add(circle);  
    }
    
    this.drawBeepers(pos, numBeepers);
}

KarelWorld.prototype.setFilename = function(file){
    this.filename = file;
}

KarelWorld.prototype.getFilename = function(){
    return this.filename;
}
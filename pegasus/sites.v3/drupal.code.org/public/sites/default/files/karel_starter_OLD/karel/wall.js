Wall.VERTICAL = 0;
Wall.HORIZONTAL = 1;

/* Create a wall. A wall is defined by two points in karels world, PT1 and PT2.
   Depending on the points, we can determine whether this is a vertical or horizontal
   wall, which makes it much easier to draw. We sort the walls after they are 
   passed to the constructor so that we always create the toString in the same way.
   
   +  +  +   +
   +  +  +   +
   +  +  + | +
   
   In this small example this is a wall between row 0 col 2 and row 0 col 3 or a wall defined by
   var wall = new Wall({row:0, col:2}, {row: 0, col:3});
 */
function Wall(pt1, pt2){
    if(pt1.col == pt2.col)
        this.orientation = Wall.HORIZONTAL;
    else
        this.orientation = Wall.VERTICAL;
    
    /* Make sure the walls are sorted. The point with the lower
       row is first. If they are equal the one with the lower col
       is first. */
    if(pt1.row < pt2.row){
        this.pt1 = pt1;
        this.pt2 = pt2;
    }else if(pt2.row < pt1.row){
        this.pt1 = pt2;
        this.pt2 = pt1;
    }else{
        if(pt1.col < pt2.col){
            this.pt1 = pt1;
            this.pt2 = pt2;
        }else{
            this.pt1 = pt2;
            this.pt2 = pt1;
        }
    }
}

/* The toString, which is key for putting these objects into sets */
Wall.prototype.toString = function(){
    return this.pt1.row + "," + this.pt1.col + ":" + this.pt2.row + "," + this.pt2.col;
}

/* Return the first point in the wall */
Wall.prototype.getFirst = function(){
    return this.pt1;
}

/* Return the second point in the wall */
Wall.prototype.getSecond = function(){
    return this.pt2;
}

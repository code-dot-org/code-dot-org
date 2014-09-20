/* Make a karel robot, with the (x,y) coord of the top left
   of the box, the box dimension, and the current direction */
function KarelRobot(x, y, dim, dir){
    Polygon.call(this);
    
    if(dir == Karel.EAST){
        this.addPoint(x, y);
        this.addPoint(x, y + dim);
        this.addPoint(x + dim, y + dim /2);
    }
    if(dir == Karel.WEST){
        this.addPoint(x + dim, y);
        this.addPoint(x + dim, y + dim);
        this.addPoint(x, y + dim/2);
    }
    if(dir == Karel.NORTH){
        this.addPoint(x, y + dim);
        this.addPoint(x + dim, y + dim);
        this.addPoint(x + dim/2, y);
    }
    if(dir == Karel.SOUTH){
        this.addPoint(x, y);
        this.addPoint(x + dim, y);
        this.addPoint(x + dim/2, y + dim);
    }
}

KarelRobot.prototype = new Polygon();
KarelRobot.prototype.constructor = KarelRobot;



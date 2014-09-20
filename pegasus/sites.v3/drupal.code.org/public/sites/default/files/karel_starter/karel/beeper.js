/* Create a beeper centered at x, y with dimension dim. Dim
    is the width of the containing box. */
function Beeper(x, y, dim){
    Polygon.call(this);

    var diff = dim / 2;
    this.addPoint(x, y - diff);
    this.addPoint(x + diff, y);
    this.addPoint(x, y + diff);
    this.addPoint(x - diff, y);
    
    this.setColor(Color.gray);
}

Beeper.prototype = new Polygon();
Beeper.prototype.constructor = Beeper;

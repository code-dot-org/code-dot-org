function Line(x1, y1, x2, y2){
    if (typeof x1 != "number" || typeof y1 != "number" || typeof x2 != "number" || typeof y2 != "number") {
        CHS.Error.libraryError("You must pass 4 numbers to <span class='code'>new Line(x1, y1, x2, y2)</span>");
        return;
    }
    Thing.call(this);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.lineWidth = 2;
}
Line.prototype = new Thing();
Line.prototype.constructor = Line;
	
Line.prototype.draw = function(){
    var context = Graphics.getContext();
    context.fillStyle = this.color;
    context.beginPath();
    context.strokeStyle = this.stroke;
	context.fillStyle = this.color;
    context.lineWidth = this.lineWidth;
    context.moveTo(this.x1, this.y1);
    context.lineTo(this.x2, this.y2);
    context.closePath();
    context.stroke();
}
Line.prototype.containsPoint = function(x, y){
    return false;
}

Line.prototype.getWidth = function(){
    return this.width;
}
Line.prototype.getHeight = function(){
    return this.height;
}
Line.prototype.setLineWidth = function(width){
    if (typeof width != "number") {
        CHS.Error.libraryError("You must pass a number to <span class='code'>setLineWidth(width)</span>");
        return;
    }
    this.lineWidth = width;
}
Line.prototype.setPosition = function(x,y){
    if (typeof x != "number" || typeof y != "number") {
        CHS.Error.libraryError("You must pass 2 numbers to <span class='code'>setPosition(x, y)</span>");
        return;
    }
    this.x1 = x;
    this.y1 = y;
}
Line.prototype.setEndpoint = function(x, y){
    if (typeof x != "number" || typeof y != "number") {
        CHS.Error.libraryError("You must pass 2 numbers to <span class='code'>setEndpoint(x, y)</span>");
        return;
    }
    this.x2 = x;
    this.y2 = y;
}

Line.prototype.move = function(dx, dy){
    if (typeof dx != "number" || typeof dy != "number") {
        CHS.Error.libraryError("You must pass 2 numbers to <span class='code'>move(x, y)</span>");
        return;
    }
    this.x1 += dx;
    this.y1 += dy;
    this.x2 += dx;
    this.y2 += dy;
}
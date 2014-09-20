function Thing(){
	this.x = 0;
	this.y = 0;
	this.color = '#000000';
	this.stroke = '#000000';
}
Thing.prototype.setPosition = function(x,y){
	this.x = x;
	this.y = y;
}
Thing.prototype.setColor = function(color){
	if (color == undefined) {
		CHS.Error.libraryError("You must pass a color to <span class='code'>setColor(color)</span>");
        return;
	}
	this.color = color;
	this.stroke = color;
}

Thing.prototype.getColor = function(){
	return this.color;
}

Thing.prototype.setBorderColor = function(color){
    this.stroke = color;
}
Thing.prototype.move = function(dx, dy){
	this.x += dx;
	this.y += dy;
}
Thing.prototype.getX = function(){
    return this.x;
}
Thing.prototype.getY = function(){
    return this.y;
}
Thing.prototype.draw = function(){
    
}
Thing.prototype.containsPoint = function(x, y){
    return false;
}
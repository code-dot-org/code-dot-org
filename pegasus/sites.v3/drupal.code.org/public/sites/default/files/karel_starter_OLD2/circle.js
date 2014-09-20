function Circle(radius){
    Thing.call(this);
	this.radius = radius;
	this.color = Color.black;
	this.lineWidth = 3;
}

Circle.prototype = new Thing;

Circle.prototype.constructor = Circle;

Circle.prototype.draw = function(){
	var context = Graphics.getContext();
	context.beginPath();
	context.strokeStyle = this.stroke;
	context.fillStyle = this.color;
	context.lineWidth = this.lineWidth;
	context.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
	context.closePath();
	//context.stroke();
	context.fill();
}

Circle.prototype.getRadius = function(){
    return this.radius;
}

Circle.prototype.getHeight = function(){
    return this.radius * 2;
}

Circle.prototype.getWidth = function(){
    return this.radius * 2;
}

Circle.prototype.setRadius = function(radius){
	if (typeof radius != "number") {
		CHS.Error.libraryError("You must pass a number to <span class='code'>setRadius(num)</span>");
        return;
	}
    this.radius = radius;
}

Circle.prototype.containsPoint = function(x, y){
    var dist = Graphics.getDistance(this.x, this.y, x, y);
    /* Must be _strictly_ less than to not return the cirlce itself */
    return dist < this.radius;
}

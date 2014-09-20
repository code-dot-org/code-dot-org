function Rectangle(width, height){
    Thing.call(this);
 	this.width = width;
 	this.height = height;
}
Rectangle.prototype = new Thing();
Rectangle.prototype.constructor = Rectangle;
	
Rectangle.prototype.draw = function(){
    var context = Graphics.getContext();
    context.fillStyle = this.color;
    context.beginPath();
    context.rect(this.x,this.y,this.width, this.height);
    context.closePath();
    context.fill();
}
Rectangle.prototype.containsPoint = function(x, y){
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
}
Rectangle.prototype.getWidth = function(){
    return this.width;
}
Rectangle.prototype.getHeight = function(){
    return this.height;
}

function Polygon(width, height){
    Thing.call(this);
    this.points = [];
}
Polygon.prototype = new Thing();
Polygon.prototype.constructor = Polygon;
	
Polygon.prototype.draw = function(){
    if(this.points.length == 0) return;
    
    var context = Graphics.getContext();
    context.fillStyle = this.color;
    context.beginPath();
    
    var first = this.points[0];
    context.moveTo(first.x, first.y);
    for(var i = 1; i < this.points.length; i++){
        var cur = this.points[i];
        context.lineTo(cur.x, cur.y);
    }
    context.closePath();
    context.fill();
}
Polygon.prototype.containsPoint = function(x, y){
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
}
Polygon.prototype.getWidth = function(){
    return this.width;
}
Polygon.prototype.getHeight = function(){
    return this.height;
}

Polygon.prototype.addPoint = function(x, y){
    this.points.push({x:x, y: y});
}
function Text(label, font){
    Thing.call(this);
    this.label = label;
    
    this.font = font == undefined ? '20pt Arial' : font;
    this.resetDimensions();
}
Text.prototype = new Thing();
Text.prototype.constructor = Text;

Text.prototype.resetDimensions = function(){
    var context = Graphics.getContext();
    context.font = this.font;
    this.width = context.measureText(this.label).width;
    this.height = context.measureText('m').width * 1.2; /* No height provided */
}
	
Text.prototype.draw = function(){
    var context = Graphics.getContext();
    context.fillStyle = this.color;
    context.beginPath();
    context.font = this.font;
    this.resetDimensions();
    context.fillText(this.label, this.x,this.y);
    context.closePath();
    context.fill();
}

Text.prototype.setFont = function(font){
    this.font = font;
    this.resetDimensions();    
}

Text.prototype.setLabel = function(label){
    this.label = label;
    this.resetDimensions();    
}

Text.prototype.setText = function(label){
    this.label = label;
    this.resetDimensions();    
}

Text.prototype.getLabel = function(label){
    return this.label;    
}

Text.prototype.getText = function(label){
    return this.label;    
}

Text.prototype.getWidth = function(){
    return this.width;
}

Text.prototype.getHeight = function(){
    return this.height;
}

Text.prototype.containsPoint = function(x, y){
    return x >= this.x && x <= this.x + this.width &&
           y <= this.y && y >= this.y - this.height;
}

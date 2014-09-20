
WebImage.NOT_LOADED = 1;
WebImage.DONE = 2;

WebImage.NUM_CHANNELS = 4;
WebImage.RED = 0
WebImage.GREEN = 1;
WebImage.BLUE = 2;
WebImage.ALPHA = 3;


function WebImage(filename){
    if (typeof filename != "string") {
        CHS.Error.libraryError("You must pass a string to <span class='code'>new WebImage(filename)</span> that has the image's location.");
        return;
    }
    Thing.call(this);
    var self = this;
    
    this.image = new Image();
    this.image.src = filename;
	this.filename = filename;
    this.width = WebImage.NOT_LOADED;
    this.height = WebImage.NOT_LOADED;
	this.image.onload = function(){
	    self.checkDimensions();
	    if(self.loadfn){
	        self.loadfn();
	    }
	    
	}
	this.set = 0;
}
WebImage.prototype = new Thing;
WebImage.prototype.constructor = WebImage;

WebImage.prototype.loaded = function(callback){
    this.loadfn = callback;
}

WebImage.prototype.checkDimensions = function(){
    if(this.width == WebImage.NOT_LOADED){
        this.width = this.image.width;
        this.height = this.image.height;
    }
}

WebImage.prototype.draw = function(){
    this.checkDimensions();
	var context = Graphics.getContext();
    context.beginPath();
    
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
    // context.strokeStyle = this.stroke;
    // context.fillStyle = this.color;
    // context.lineWidth = this.lineWidth;
	/* HACKY */
//	if(this.set != WebImage.DONE){
 //       context.drawImage(this.image, this.x, this.y, this.width, this.height);
//	    this.data = context.getImageData(this.x, this.y, this.width, this.height);
//	    this.set++;
//	}else{
//	    /* TODO: Getting called twice??? */
//	    context.putImageData(this.data, this.x, this.y);
//	}
  context.closePath();
}
WebImage.prototype.containsPoint = function(x, y){
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
}
WebImage.prototype.getWidth = function(){
    return this.width;
}
WebImage.prototype.getHeight = function(){
    return this.height;
}

WebImage.prototype.setSize = function(width, height){
    this.width = width;
    this.height = height;
}

/* Get and set pixel functions */

WebImage.prototype.getPixel = function(x, y){
    var index = WebImage.NUM_CHANNELS * (y * this.width + x);
    var pixel = [
            this.data.data[index + WebImage.RED],
            this.data.data[index + WebImage.GREEN],
            this.data.data[index + WebImage.BLUE],
            this.data.data[index + WebImage.ALPHA]
                ];
    return pixel;
}

WebImage.prototype.getRed = function(x, y){
    return this.getPixel(x, y)[WebImage.RED];
}

WebImage.prototype.getGreen = function(x, y){
    return this.getPixel(x, y)[WebImage.GREEN];    
}

WebImage.prototype.getBlue = function(x, y){
    return this.getPixel(x, y)[WebImage.BLUE];
}

WebImage.prototype.getAlpha = function(x, y){
    return this.getPixel(x, y)[WebImage.ALPHA];
}

WebImage.prototype.setPixel = function(x, y, component, val){
    var index = WebImage.NUM_CHANNELS * (y * this.width + x);
    this.data.data[index + component] = val;
}

WebImage.prototype.setRed = function(x, y, val){
    this.setPixel(x, y, WebImage.RED, val);
}
WebImage.prototype.setGreen = function(x, y, val){
    this.setPixel(x, y, WebImage.GREEN, val);
}
WebImage.prototype.setBlue = function(x, y, val){
    this.setPixel(x, y, WebImage.BLUE, val);
}
WebImage.prototype.setAlpha = function(x, y, val){
    this.setPixel(x, y, WebImage.ALPHA, val);
}




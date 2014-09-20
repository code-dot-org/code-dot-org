var Graphics = {};

/* Private graphics structures and methods */

Graphics.elements = [];
Graphics.clickCallback = null;
Graphics.moveCallback = null;
Graphics.mouseDownCallback = null;
Graphics.mouseUpCallback = null;
Graphics.dragCallback = null;
Graphics.keyDownCallback = null;
Graphics.keyUpCallback = null;

Graphics.pressedKeys = [];
Graphics.timers = {};

Graphics.clickCount = 0;
Graphics.delayedTimers = [];

Graphics.globalTimer = true;

Graphics.DEFAULT_FRAME_RATE = 40;

Graphics.exists = false;

Graphics.isGraphicsProgram = function(){
    return typeof Graphics.getCanvas() != "undefined";
}

Graphics.setSize = function(width, height){
    var canvas = Graphics.getCanvas();
    canvas.width = width;
    canvas.height = height;
}

Graphics.fullReset = function(){
    for(var cur in Graphics.timers){
        clearInterval(Graphics.timers[cur]);
    }    
    Graphics.elements = [];
    Graphics.clickCallback = null;
    Graphics.moveCallback = null;
    Graphics.mouseDownCallback = null;
    Graphics.mouseUpCallback = null;
    Graphics.dragCallback = null;
    Graphics.keyDownCallback = null;
    Graphics.keyUpCallback = null;
    
    Graphics.pressedKeys = [];
    Graphics.timers = {};
    
    Graphics.clickCount = 0;
    Graphics.delayedTimers = [];
    
    Graphics.globalTimer = true;
    Graphics.setMainTimer();
    Graphics.currentCanvas = null;
}

Graphics.currentCanvas = null;

Graphics.setCurrentCanvas = function(canvas){
    Graphics.currentCanvas = canvas;
}

Graphics.getContext = function(){
	var drawingCanvas = Graphics.getCanvas();
	// Check the element is in the DOM and the browser supports canvas
	if(drawingCanvas.getContext) {
	    // Initaliase a 2-dimensional drawing context
		var context = drawingCanvas.getContext('2d');
		return context;
	}
	return null;
}

Graphics.redraw = function(){
    clear();
    for(var i = 0; i < Graphics.elements.length; i++){
      //  console.log(elements[i]);
        Graphics.elements[i].draw();
    }
}

Graphics.getDistance = function(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
}

/* If a canvas has been explictly set, return it. */
Graphics.getCanvas = function(){
    if(Graphics.currentCanvas != null){
        return Graphics.currentCanvas;
    }
    // Otherwise just return the first canvas
    return document.getElementsByTagName('canvas')[0];
}

Graphics.waitingForClick = function(){
    return Graphics.clickCount != 0;
}

Graphics.setup = function(){
    var drawingCanvas = Graphics.getCanvas();
    console.log("GRaphics exists" + Graphics.exists);
    console.log(drawingCanvas);

    if(typeof drawingCanvas == "undefined") {
        Graphics.exists = false;

        console.log("GRaphics exists" + Graphics.exists);
        console.log(drawingCanvas);
        return;
    }else{
        Graphics.exists = true;
    }
    
	drawingCanvas.onclick = function(e){
	    if(Graphics.waitingForClick()){
	        Graphics.clickCount--;
	        
	        for(var i = 0; i < Graphics.delayedTimers.length; i++){
	            var timer = Graphics.delayedTimers[i];
	            timer.clicks--;
	            if(timer.clicks == 0){
	                Graphics.setGraphicsTimer(timer.fn, timer.time, timer.data);
	            }
	        }
	        return;
	    }
	    
	    if(Graphics.clickCallback){
	        Graphics.clickCallback(e);
	    }
	}
	
	var mouseDown = false;
	
	drawingCanvas.onmousemove = function(e){
	    if(Graphics.moveCallback){
	        Graphics.moveCallback(e);
	    }
	    if(mouseDown && Graphics.dragCallback){
	        Graphics.dragCallback(e);
	    }
	}
	
	drawingCanvas.onmousedown = function(e){
	    mouseDown = true;
	    if(Graphics.mouseDownCallback){
	        Graphics.mouseDownCallback(e);
	    }
	}
	
	drawingCanvas.onmouseup = function(e){
	    mouseDown = false;
	    if(Graphics.mouseUpCallback){
	        Graphics.mouseUpCallback(e);
	    }
	}
	
	window.onkeydown = function(e){
		var index = Graphics.pressedKeys.indexOf(e.keyCode);
		if (index == -1) {
			Graphics.pressedKeys.push(e.keyCode);
		}
	    if(Graphics.keyDownCallback){
	        Graphics.keyDownCallback(e);
			// Override the default behavior of certain keys
			var toReturn = true;
			if (e.keyCode == Keyboard.SPACE) {
				toReturn = false;
			}
			if (e.keyCode >= Keyboard.LEFT && e.keyCode <= Keyboard.DOWN) {
				toReturn = false;
			}
			return toReturn;
	    }
	}
	
	window.onkeyup = function(e) {
		var index = Graphics.pressedKeys.indexOf(e.keyCode);
		if (index != -1) {
			Graphics.pressedKeys.splice(index,1);
		}
		if (Graphics.keyUpCallback) {
			Graphics.keyUpCallback(e);
		}
	}
	
    Graphics.setMainTimer();
}

Graphics.setMainTimer = function(){
    	/* Refresh the screen every 40 ms */
    	if(Graphics.globalTimer)
    	    setTimer(Graphics.redraw, Graphics.DEFAULT_FRAME_RATE, null, "MAIN_TIMER");
    //	setTimer(Graphics.redraw, 1000);    
}


Graphics.start = function(){
    Graphics.setup();
    if(typeof start == 'function')
        start();
}

Graphics.setGraphicsTimer = function(fn, time, data, name){
//    console.log(Graphics.timers);

    if(typeof name == "undefined")
        name = fn;
        
//    console.log(name);
    
    Graphics.timers[name] = setInterval(function(){
      Graphics.redraw();
     // console.log(fn);
     // console.log('here');
      fn(data);
    }, time);
}


/* Mouse Event Helpers */

/* Method based on: http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element */
Graphics.getMouseCoordinates = function(e){
    var x;
    var y;
    if (e.pageX || e.pageY) { 
      x = e.pageX;
      y = e.pageY;
    }
    else { 
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
    } 
    x -= Graphics.getCanvas().offsetLeft;
    y -= Graphics.getCanvas().offsetTop;
    return {x: x, y: y};
}

MouseEvent.prototype.getX = function(){
    return Graphics.getMouseCoordinates(this).x;
}
MouseEvent.prototype.getY = function(){
    return Graphics.getMouseCoordinates(this).y;
}

/* Public facing methods */	

function waitForClick(){
    if(!Graphics.exists) return; /* ERROR */
    
    
    Graphics.clickCount++;
}


function mouseClickMethod(fn){
    if(!Graphics.exists) return; /* ERROR */
    
    
    Graphics.clickCallback = fn;
}

function mouseMoveMethod(fn){
    if(!Graphics.exists) return; /* ERROR */
    
    
    Graphics.moveCallback = fn;
}

function mouseDownMethod(fn){
    if(!Graphics.exists) return; /* ERROR */

    Graphics.mouseDownCallback = fn;
}

function mouseUpMethod(fn){
    if(!Graphics.exists) return; /* ERROR */
    
    
    Graphics.mouseUpCallback = fn;
}

function mouseDragMethod(fn){
    if(!Graphics.exists) return; /* ERROR */
    
    
    Graphics.dragCallback = fn;
}

function keyDownMethod(fn){
    if(!Graphics.exists) return; /* ERROR */
    
    
    Graphics.keyDownCallback = fn;
}

function keyUpMethod(fn){
    if(!Graphics.exists) return; /* ERROR */
    
    
    Graphics.keyUpCallback = fn;
}

// Returns true if the given key is currently pressed
function isKeyPressed(keyCode) {
    if(!Graphics.exists) return; /* ERROR */
    
    
	return Graphics.pressedKeys.indexOf(keyCode) != -1;
}

function add(elem){
    if(!Graphics.exists) {
        CHS.Error.libraryError("There is no canvas, so you can't call <span class='code'>add()</span>");
        return; /* ERROR */
    }
	Graphics.elements.push(elem);
}

function getWidth(){
    if(!Graphics.exists) return; /* ERROR */
    
    
    var canvas = Graphics.getCanvas();
    return parseFloat(canvas.getAttribute('width'));
}

function getHeight(){
    if(!Graphics.exists) return; /* ERROR */
    
    
    var canvas = Graphics.getCanvas();
    return parseFloat(canvas.getAttribute('height'));
}

/* fn may also be the name */
function stopTimer(fn){
    clearInterval(Graphics.timers[fn]);
}

function setTimer(fn, time, data, name){
    // Safety, set a min frequency
    if(time < 15) time = 15;
    
    if(Graphics.waitingForClick()){
        Graphics.delayedTimers.push({
            fn: fn,
            time: time,
            data: data,
            clicks: Graphics.clickCount,
            name: name
        });
    }else{
        Graphics.setGraphicsTimer(fn, time, data, name);
    }
}

function clear(){
    if(!Graphics.exists) return; /* ERROR */
    
    
    var ctx = Graphics.getContext();
    ctx.clearRect(0, 0, getWidth(), getHeight());
}

function getElementAt(x, y){
    if(!Graphics.exists) return; /* ERROR */
    
    
    for(var i = Graphics.elements.length -1; i >= 0; i--){
        if(Graphics.elements[i].containsPoint(x,y))
            return Graphics.elements[i];
    }
    return null;
}

function removeAll(){
    if(!Graphics.exists) return; /* ERROR */
    
    Graphics.elements = [];
}

function remove(elem){
    if(!Graphics.exists) return; /* ERROR */
    
    for(var i = 0; i < Graphics.elements.length; i++){
        if(Graphics.elements[i] == elem){
            Graphics.elements.splice(i, 1); // Remove from list
        }
    }
}

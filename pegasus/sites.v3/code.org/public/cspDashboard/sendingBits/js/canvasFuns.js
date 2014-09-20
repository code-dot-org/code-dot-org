var canvas;
var canvasTimerId;
var delayVal = 25;
var width, height;
var alpha = 1;
function background(c){
	fill(c);
	canvas.globalAlpha=alpha;
	rect(0,0,width,height);
	canvas.globalAlpha=1;
}

function setDelay(ms){
	//if changing delay want to clear old timer anyway
	// or old one will continue to be called in separate
	// thread
	clearInterval(canvasTimerId);


	if(ms>=0){
		canvasTimerId = setInterval(setDrawVars, ms);
		delayVal=ms;
	}
}

function pause(){ setDelay(-1);}
function start(){ setDelay(delayVal); }


function setDrawVars(){
	canvas = document.getElementById("myCanvas").getContext("2d");
	width = canvas.canvas.width;
	height = canvas.canvas.height;
	draw();
}

function setSize(w,h){
	canvas.canvas.width=w;
	canvas.canvas.height=h;


}

function init(){
	setDrawVars(); //ensure canvas var exists
	setDelay(25); //ensure a delay has been set
	setup();
	
}

function fill(c){
	canvas.fillStyle = c;
}

function rect(x,y,w,h){
	canvas.fillRect(x,y,w,h);
}

function draw(){
	rect(10,10,20,40);
}
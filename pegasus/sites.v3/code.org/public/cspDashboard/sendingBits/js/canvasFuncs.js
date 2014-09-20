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
		canvasTimerId = setInterval(setVarsAndDraw, ms);
		delayVal=ms;
	}
}

function pause(){ setDelay(-1);}
function start(){ setDelay(delayVal); }


function setDrawVars(){
	canvas = document.getElementById("myCanvas").getContext("2d");
	width = canvas.canvas.width;
	height = canvas.canvas.height;
	

}
function setVarsAndDraw(){
	canvas = document.getElementById("myCanvas").getContext("2d");
	width = canvas.canvas.width;
	height = canvas.canvas.height;
	draw();
}

function line(x,y,x2,y2){

	canvas.beginPath();
      canvas.moveTo(x, y);
      canvas.lineTo(x2, y2);
      canvas.stroke();
}

function setSize(w,h){
	canvas.canvas.width=w;
	canvas.canvas.height=h;


}

function init(){

	setDrawVars(); //ensure canvas var exists
		setup();

	setDelay(20); //ensure a delay has been set

}

function fontSize(s){
	canvas.font = s+"px sans-serif";
}
function stroke(c){
	canvas.strokeStyle = c;
}
function strokeWeight(w){
	canvas.lineWidth=w;
}
function fill(c){
	canvas.fillStyle = c;
}
function fillText(someText, x, y){

	canvas.fillText(someText, x, y);
}
function circle(centerX, centerY,radius) {
	
  canvas.beginPath();
      canvas.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      //canvas.fillStyle = 'green';
      canvas.fill();
      
}

function rect(x,y,w,h){
	canvas.fillRect(x,y,w,h);
}
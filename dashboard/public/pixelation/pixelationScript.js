function drawGraph(){
	var c=document.getElementById("canvas");
	var ctx=c.getContext("2d");
	ctx.fillStyle="#CCCCCC";
	ctx.fillRect(0,0,500,500);
	var black = "#000000";
	var white = "#FFFFFF";
	ctx.fillStyle = black;
	var w = parseInt(document.getElementById("width").value);
	var h = parseInt(document.getElementById("height").value);
	
	var sqSize = (500/Math.max(w,h))-1;
	var binCode=document.getElementById("binaryImage").value.replace(/[^01]/gi,"");
	var charIndex=0;
	var errMsg="Length ";
	
	
	if(binCode.length != w*h) errMsg+= "ERROR. ";
	else errMsg+="ok. "
	errMsg += "binary:"+binCode.length+", WxH:"+(w*h);
	
	for(var y=0; y<h; y++){
		for(var x=0; x<w; x++){
			charIndex = (y*w)+x;
			
			var val = binCode.charAt(charIndex);
			//console.debug("x="+x+", y="+y+", code["+charIndex+"]= >>"+val+"<<");
			if(val=="") ctx.fillStyle="#FFDDDD";
			else if(val=="1") ctx.fillStyle = white;
			else ctx.fillStyle=black;
		
			ctx.fillRect(x*(sqSize+1), y*(sqSize+1),sqSize,sqSize);
		}
	}
	
	document.getElementById("err").innerHTML = errMsg;
}

function changeVal(elementID){
	var val=-1;
	
	if(elementID=="width") val = document.getElementById("widthRange").value;
	else val = document.getElementById("heightRange").value;
	
	document.getElementById(elementID).value = val;

	drawGraph();
}
function setSliders(){
	document.getElementById("heightRange").value = document.getElementById("height").value;
	document.getElementById("widthRange").value =  document.getElementById("width").value;

}

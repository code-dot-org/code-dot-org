


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
	
	
	//document.getElementById("sqsize").value = (500/Math.max(w,h))-1;

	var bitsPerPix = parseInt(document.getElementById("bitsPerPixel").value);
	
	

	var binCode="";
	var binCodeDisplay="";
	
	if(document.getElementsByName("binHex")[1].checked){ //if the hex radio button is currently selected
	
		//then we need to get the binary representation for this function to work
		var allHexDigits = document.getElementById("binaryImage").value.replace(/[^0-9A-F]/gi,"");
		var hexDisplay = document.getElementById("binaryImage").value.replace(/[^0-9A-F\n]/gi,"");
		//document.getElementById("binaryImage").value = formatDisplayData(hexDisplay, 2);

		binCode = hexToBinPvt(allHexDigits);
		console.debug("hex is checked, binCODE:"+binCode);	
	}
	else{
		//otherwise take the straight binary from the text input

		//the text area should preserve line breaks, 0s and 1s
		binCodeDisplay=document.getElementById("binaryImage").value.replace(/[^01\n]/gi,"");

		//binary code needs to have everything stripped except for 0s and 1s
		binCode=document.getElementById("binaryImage").value.replace(/[^01]/gi,"");

		// replace the text in the text area with a formated version
		//document.getElementById("binaryImage").value = formatDisplayData(binCodeDisplay, 4);

		console.debug("bin is checked, binCODE:"+binCode);	
	}
	var charIndex=0;
	var errMsg="Length ";
	
	//read width, height out of the bit string
	// where width is given in byte 0, height in byte 1

	w = binToInt(readByte(binCode, 0));
	h = binToInt(readByte(binCode, 1));
	document.getElementById("width").value = w;
	document.getElementById("height").value = h;

	//console.debug("square size="+sqSize)
	
	//if(document.getElementById('encodeWH').checked){
		
	//	document.getElementById("width").disabled=true;
	//	document.getElementById("height").disabled=true;

	// }
	// else{
	// 	document.getElementById("width").disabled=false;
	// 	document.getElementById("height").disabled=false;
	// 	w = parseInt(document.getElementById("width").value);
	// 	h = parseInt(document.getElementById("height").value);
	// }
	
	
	

	var imgBitString = binCode.substring(16,binCode.length);
	//console.debug("imgBitString: "+imgBitString);

	var colorNums = bitsToColors(imgBitString,bitsPerPix);
	//console.debug("colorNums: "+colorNums);
	
	if(colorNums.length != w*h) errMsg+= "ERROR. ";
	else errMsg+="ok. "
	errMsg += "binary:"+colorNums.length+", WxH:"+(w*h);
	//document.getElementById("example").innerHTML ="";
	//displayColorList(colorNums);

	//var sqSize = (500/Math.max(w,h))-1;
	document.getElementById("sqSizeSlider").setAttribute("max", (500/Math.max(w,h))-1)
	
	sqSize = parseInt(document.getElementById("sqSizeSlider").value);
	document.getElementById("sqSizeLabel").innerHTML = sqSize+" px";

	var pixelBorder = 0;
	if(document.getElementById("showPixelBorder").checked){
		pixelBorder=1;
	}
	document.getElementById("canvas").width = w*(sqSize+pixelBorder);
	document.getElementById("canvas").height = h*(sqSize+pixelBorder);

	for(var y=0; y<h; y++){
		for(var x=0; x<w; x++){
			index = (y*w)+x;
			if(index>=colorNums.length) ctx.fillStyle="#FFDDDD";
			else{
				var colorVal = colorNums[index];
				//document.getElementById("example").innerHTML +=colorNums[index]+"\n";
			//console.debug("x="+x+", y="+y+", code["+charIndex+"]= >>"+val+"<<");
				ctx.fillStyle=colorVal;
			}
			ctx.fillRect(x*(sqSize+pixelBorder), y*(sqSize+pixelBorder),sqSize,sqSize);
		}
	}
	
	document.getElementById("err").innerHTML = errMsg;
	
}


function hexToBin(){
	var allHexDigits = document.getElementById("binaryImage").value.replace(/[^0-9A-F]/gi,"");
	console.debug("about to convert HEX2BIN and write to text area");
	document.getElementById("binaryImage").value = hexToBinPvt(allHexDigits);

}


function pad(str, len, prefix){
	
	while(str.length !== len){
		str = prefix+str;
	}
	return str;
}

function hexToBinPvt(allHexDigits){
	
	var binString ="";
	for(var i=0; i<allHexDigits.length; i++){
		binString += pad(parseInt(allHexDigits.substring(i,i+1), 16).toString(2), 4, "0");
	}
	return binString;

}

//add spaces every 4-bits if not present
// preserve line breaks, by ignoring them.
// only add spaces to visible characters
// assuming spaces have been stripped
//@param dataString can be a string of binary or hex data
// @param chunkSize defines how many characters should appear
// between spaces.
function formatDisplayData(dataString, chunkSize){

	var data = "";
	var chunkCount = 0;
	 for(var i=0; i<dataString.length; i++){

	 	data+=dataString.charAt(i);

	 	if(dataString.charAt(i)!="\n") chunkCount++;

		if(chunkCount==chunkSize){
			data+=" ";
			chunkCount = 0; 
			//tried to use % for this functionality but too many boundary off-by-one cases
		}		
	}
	
	if(data.charAt(data.length-1)==" "){
		return data.substring(0,data.length-1);
	}
	return data;
}

function binToHexPvt(allBits){
	var hexString="";
	//work in chunks of 8
	for(var i=0; i<allBits.length; i+=4){
		hexString += parseInt(allBits.substring(i,i+4),2).toString(16).toUpperCase();
	}
	return hexString;
	

}

function binToHex(){
	
	var allBits = document.getElementById("binaryImage").value.replace(/[^01]/gi,"");
		console.debug("about to convert BIN2HEX and write to text area");

	document.getElementById("binaryImage").value = binToHexPvt(allBits); 


}

function getColorVal_colorSpace(binVal, bitsPerPixel){
	//treat bits per pixel as a range, and divide range up
	// evenly accross RGB space.

	//e.g. bits/pixel = 32
	// then red is a scaler between 0-10
	//  green is scaler between 11-22
	//  blue is scaler between 23-32



}


//if bitsPerPixel is not divisible by 3
	// then treat binVal as greyscale value
	// can only do RGB when integer numbers of bits
	// can be assigned to R, G, B
	// need bitsPerPixel to handle irregular length binVals
		// which should only happen with jagged ends of bit strings

function getColorVal2(binVal, bitsPerPixel){



	// assume binVal is size of bits per pixel
	//var bitsPerPixel = binVal.length;
	console.debug("bitsPerPixel = "+bitsPerPixel)

	var numColors = Math.pow(2,bitsPerPixel);
	var bitsPerColor = parseInt(bitsPerPixel/3);


	if(bitsPerColor*3 != bitsPerPixel){
		var val = (binToInt(binVal)/ (numColors-1)) *255;
		val = parseInt(val);
		console.debug("Grayscale! -- "+val);
		return "rgb("+val+", "+val+", "+val+")";
	}
	else{
		console.debug("bitsPerColor = "+bitsPerColor)
		var maxRGBVal = Math.max(Math.pow(2,bitsPerColor)-1,1);

		var R = binVal.substring(0,bitsPerColor);
		var G = binVal.substring(bitsPerColor, bitsPerColor*2 );
		var B = binVal.substring(bitsPerColor*2, bitsPerColor*3);

		console.debug("rgb="+R+","+G+","+B);
		
		var Rval = parseInt((binToInt(R)/(maxRGBVal))*255);

		var Gval = parseInt((binToInt(G)/(maxRGBVal))*255);
		var Bval = parseInt((binToInt(B)/(maxRGBVal))*255);
		

		console.debug("rgbVals="+Rval+","+Gval+","+Bval);

	
		return "rgb("+Rval+","+Gval+","+Bval+")";


	}





}

/*
	@param binVal is some binary value
*/
function getColorVal(binVal, bitsPerColor){

	if(bitsPerColor<1){//klugy workaround for one-bit pixels
		if(binVal=="1")return "rgb(255,255,255)";
		else return "rgb(0,0,0)";
	
	
	}
	var range = Math.pow(2,bitsPerColor);

	console.debug("range="+range);

	var R = binVal.substring(0,bitsPerColor);
	var G = binVal.substring(bitsPerColor, bitsPerColor*2 );
	var B = binVal.substring(bitsPerColor*2, bitsPerColor*3);
	console.debug("rgb="+R+","+G+","+B);
		
	var Rval = parseInt((parseInt(R,2)*255)/(range-1));
	var Gval = parseInt((parseInt(G,2)*255)/(range-1));
	var Bval = parseInt((parseInt(B,2)*255)/(range-1));
	

	console.debug("rgbVals="+Rval+","+Gval+","+Bval);

	
	return "rgb("+Rval+","+Gval+","+Bval+")";
}

//extract the given byte from the bitString
function readByte(bitString, byteNum){

	return bitString.substring(byteNum*8, byteNum*8+8);
}

function binToInt(bits){

	if(bits.length==0) return 0;

	return parseInt(bits, 2);
}

function bitsToInts(bits, chunkSize){
	var numList=new Array();
	
	for(var i=0; i<bits.length; i+=chunkSize){
		numList.push(parseInt(bits.substring(i,i+chunkSize),2));
		
	}
	if((bits.length/chunkSize)!=numList.length) numList.pop();
	
	document.getElementById("example").innerHTML = numList;
	return numList;
		

}

function displayColorList(list){
	document.getElementById("example").innerHTML = "";

	for(var i=0; i<list.length; i++){
		document.getElementById("example").innerHTML += list[i].replace("rgb(","[").replace(")","] ");
	}
}
	

/*
 Canvas needs an array of RGB colors to render image.
 This function reads the given bit string, pulling off chunks
 of size bitsPerPixel and making an RGB color out of it.
*/
function bitsToColors(bitString, bitsPerPixel){
	var colorList=new Array();
	
	for(var i=0; i<bitString.length; i+=bitsPerPixel){
		colorList.push(getColorVal2(bitString.substring(i,i+bitsPerPixel), bitsPerPixel));
		
	}
	if((bitString.length/bitsPerPixel)!=colorList.length) colorList.pop();
	
	//document.getElementById("example").innerHTML = colorList;
	return colorList;
		

}

function changeVal(elementID){
	var val=-1;
	
	if(elementID=="width") val = document.getElementById("widthRange").value;
	else if(elementID="bitsPerPixel"){
		val=document.getElementById("bitsPerPixelSlider").value;
		if(val==0) val=1;
	}
	else val = document.getElementById("heightRange").value;
	
	document.getElementById(elementID).value = val;

	drawGraph();
}
function setSliders(){
	document.getElementById("heightRange").value = document.getElementById("height").value;
	document.getElementById("widthRange").value =  document.getElementById("width").value;
	document.getElementById("bitsPerPixelSlider").value =  document.getElementById("bitsPerPixel").value;

}

//Creates a PNG the given canvas and opens it in a new window.
// Image can be copy/pasted, saved, etc. from there
//@param canvasId the id of the canvas you want to make a PNG of
function showPNG(canvasId){

	var canvas = document.getElementById(canvasId);
	var ctx=canvas.getContext("2d");

	window.open(canvas.toDataURL(),canvasId,"width="+canvas.width+", height="+canvas.height+", left=100, menubar=0, titlebar=0, scrollbars=0");
}

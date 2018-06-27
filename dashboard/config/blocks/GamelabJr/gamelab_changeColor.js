function hexToHSL(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    r = parseInt(result[1], 16);
    g = parseInt(result[2], 16);
    b = parseInt(result[3], 16);
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max == min){
      h = s = 0; // achromatic
    }else{
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
  var HSL = new Object();
  HSL['h']=h;
  HSL['s']=s;
  HSL['l']=l;
  return HSL;
}

function HSLToHex(h, s, l) {
	if (s == 0) {
		return [l, l, l];
	}

	var temp2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
	var temp1 = 2 * l - temp2;

	h /= 360;

	var
	rtemp = (h + 1 / 3) % 1,
	gtemp = h,
	btemp = (h + 2 / 3) % 1,
	rgb = [rtemp, gtemp, btemp],
	i = 0;

	for (; i < 3; ++i) {
		rgb[i] = rgb[i] < 1 / 6 ? temp1 + (temp2 - temp1) * 6 * rgb[i] : rgb[i] < 1 / 2 ? temp2 : rgb[i] < 2 / 3 ? temp1 + (temp2 - temp1) * 6 * (2 / 3 - rgb[i]) : temp1;
	}

    var myHex = "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
  
	return myHex;
}


function changeColor(color1, changeType, amount) {
  
  if (changeType == "tint") {
    var myColor = hexToHSL(color1);
    myColor.h = (myColor.h + amount) % 360;
    myColor = HSLToHex(myColor.h, myColor.s, myColor.l);
    return myColor;
    
  }
  else if (changeType == "tone") {
    var myColor = hexToHSL(color1);
    myColor.s = (myColor.s + amount) % 100;
    myColor = HSLToHex(myColor.h, myColor.s, myColor.l);
    return myColor;
  }
  
  else if (changeType == "shade") {
   	var myColor = hexToHSL(color1);
    myColor.l = (myColor.l + amount) % 100;
    myColor = HSLToHex(myColor.h, myColor.s, myColor.l);
    return myColor;
  } 
  
  else {
    return;
  }
  
  
  
  
  
  
 
}
/**
 * Pixelation widget for visualizing image encoding.
 *
 * Original code by Baker Franke.
 */

function drawGraph() {
  var c = document.getElementById("canvas");
  var ctx = c.getContext("2d");
  ctx.fillStyle = "#CCCCCC";
  ctx.fillRect(0, 0, 500, 500);
  ctx.fillStyle = "#000000";

  var binCode = "";
  var binCodeDisplay = "";

  // If the hex radio button is currently selected.
  if (document.getElementsByName("binHex")[1].checked) {

    // Then we need to get the binary representation for this function to work.
    var allHexDigits = document.getElementById("binaryImage").value.replace(/[^0-9A-F]/gi, "");

    binCode = hexToBinPvt(allHexDigits);
    console.debug("hex is checked, binCODE:" + binCode);
  }
  else {
    // Otherwise take the straight binary from the text input.
    // The text area should preserve line breaks, 0s and 1s.
    binCodeDisplay = document.getElementById("binaryImage").value.replace(/[^01 \n]/gi, "");
    document.getElementById("binaryImage").value = binCodeDisplay;

    // Binary code needs to have everything stripped except for 0s and 1s.
    binCode = document.getElementById("binaryImage").value.replace(/[^01]/gi, "");
    console.debug("bin is checked, binCODE:" + binCode);
  }
  var errMsg = "Length ";

  // Read width, height out of the bit string (where width is given in byte 0, height in byte 1).

  var w = binToInt(readByte(binCode, 0));
  var h = binToInt(readByte(binCode, 1));
  document.getElementById("width").value = w;
  document.getElementById("height").value = h;

  var bitsPerPix = binToInt(readByte(binCode, 2));
  console.debug("read bits per pix: " + bitsPerPix);

  document.getElementById("bitsPerPixel").value = bitsPerPix;
  document.getElementById("bitsPerPixelSlider").value = bitsPerPix;

  var imgBitString = binCode.substring(24, binCode.length);
  var colorNums = bitsToColors(imgBitString, bitsPerPix);

  if (colorNums.length != w * h) {
    errMsg += "ERROR. ";
  } else {
    errMsg += "ok. ";
  }
  errMsg += "binary:" + colorNums.length + ", WxH:" + (w * h);

  var sqSizeMax = parseInt((500 / Math.max(w, h)) - 1);
  sqSizeMax = Math.max(sqSizeMax, 1);
  console.debug("Calculating sqSize max=" + sqSizeMax);

  document.getElementById("sqSizeSlider").setAttribute("max", sqSizeMax);

  var sqSize = parseInt(document.getElementById("sqSizeSlider").value);
  document.getElementById("sqSizeLabel").innerHTML = sqSize + " px";

  var pixelBorder = 0;
  if (document.getElementById("showPixelBorder").checked) {
    pixelBorder = 1;
  }
  document.getElementById("canvas").width = w * (sqSize + pixelBorder);
  document.getElementById("canvas").height = h * (sqSize + pixelBorder);

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var index = (y * w) + x;
      if (index >= colorNums.length) {
        ctx.fillStyle = "#FFDDDD";
      } else {
        ctx.fillStyle = colorNums[index];
      }
      ctx.fillRect(x * (sqSize + pixelBorder), y * (sqSize + pixelBorder), sqSize, sqSize);
    }
  }

  document.getElementById("err").innerHTML = errMsg;
}

function formatBitDisplay() {

  var theData = document.getElementById("binaryImage").value;
  var chunksPerLine = parseInt(document.getElementById("width").value);
  var chunkSize = parseInt(document.getElementById("bitsPerPixel").value);

  // If in binary mode.
  var newBits = formatBits(theData, chunkSize, chunksPerLine);
  if (newBits != null) {
    document.getElementById("binaryImage").value = newBits;
  }
}

function unformatBits() {
  document.getElementById("binaryImage").value = document.getElementById("binaryImage").value.replace(/[ \n]/g, "");
}

/**
 * Take an unformatted string of bits, place spaces at "chunkSize" offsets (except for the first 3 bytes).
 */
function formatBits(bitString, chunkSize, chunksPerLine) {

  var justBits = bitString.replace(/[ \n]/g, "");
  console.debug("BEFORE: " + justBits);

  var isHex = "hex" == document.querySelector('input[name="binHex"]:checked').value;

  var formattedBits = "";
  // First break out first 3 bytes (w, h, bpp).
  if (isHex) {
    formattedBits += justBits.substring(0, 2) + "\n"; //width
    formattedBits += justBits.substring(2, 4) + "\n"; //height
    formattedBits += justBits.substring(4, 6) + "\n"; //bpp
    // Remove first 24 bits from justBits.
    justBits = justBits.substring(6);
  } else {
    // Binary.
    formattedBits += justBits.substring(0, 4) + " " + justBits.substring(4, 8) + "\n";
    formattedBits += justBits.substring(8, 12) + " " + justBits.substring(12, 16) + "\n";
    formattedBits += justBits.substring(16, 20) + " " + justBits.substring(20, 24) + "\n";

    // Remove first 24 bits from justBits.
    justBits = justBits.substring(24);
  }

  if (isHex && chunkSize % 4 != 0) {
    // If in hex mode can't break stuff up that's not multiple of 4 bits.
    formattedBits += justBits;
    return formattedBits;
  }

  if (isHex) {
    // Every char is 4 bits in hex.
    chunkSize = chunkSize / 4;
  }

  var lineLengthCount = 0;
  var charsPerLine = chunksPerLine * (chunkSize + 1);

  while (justBits.length > 0) {
    formattedBits += justBits.substring(0, chunkSize) + " ";
    lineLengthCount += (chunkSize + 1);
    justBits = justBits.substring(chunkSize);

    // Place line break based on width chosen by user, where line width = (chunkSize + 1) * width.
    if (lineLengthCount == charsPerLine) {
      formattedBits += "\n";
      lineLengthCount = 0;
    }
  }

  console.debug("AFTER: " + formattedBits);
  return formattedBits;
}

function hexToBin() {
  var allHexDigits = document.getElementById("binaryImage").value.replace(/[^0-9A-F]/gi, "");
  console.debug("about to convert HEX2BIN and write to text area");
  document.getElementById("binaryImage").value = hexToBinPvt(allHexDigits);
  formatBitDisplay();
}

function pad(str, len, prefix) {

  while (str.length !== len) {
    str = prefix + str;
  }
  return str;
}

function hexToBinPvt(allHexDigits) {

  var binString = "";
  for (var i = 0; i < allHexDigits.length; i++) {
    binString += pad(parseInt(allHexDigits.substring(i, i + 1), 16).toString(2), 4, "0");
  }
  return binString;

}

function binToHexPvt(allBits) {
  var hexString = "";
  // Work in chunks of 8.
  for (var i = 0; i < allBits.length; i += 4) {
    hexString += parseInt(allBits.substring(i, i + 4), 2).toString(16).toUpperCase();
  }
  return hexString;
}

function binToHex() {

  var allBits = document.getElementById("binaryImage").value.replace(/[^01]/gi, "");
  console.debug("about to convert BIN2HEX and write to text area");

  document.getElementById("binaryImage").value = binToHexPvt(allBits);
  formatBitDisplay();
}

/**
 * If bitsPerPixel is not divisible by 3, then treat binVal as greyscale value.  Can only do RGB when integer numbers
 * of bits.  Can be assigned to R, G, B.  Need bitsPerPixel to handle irregular length binVals, which should only happen
 * with jagged ends of bit strings.
 */
function getColorVal2(binVal, bitsPerPixel) {

  // Assume binVal is size of bits per pixel.
  console.debug("bitsPerPixel = " + bitsPerPixel);

  var numColors = Math.pow(2, bitsPerPixel);
  var bitsPerColor = parseInt(bitsPerPixel / 3);

  if (bitsPerColor * 3 != bitsPerPixel) {
    var val = (binToInt(binVal) / (numColors - 1)) * 255;
    val = parseInt(val);
    console.debug("Grayscale! -- " + val);
    return "rgb(" + val + ", " + val + ", " + val + ")";
  } else {
    console.debug("bitsPerColor = " + bitsPerColor);
    var maxRGBVal = Math.max(Math.pow(2, bitsPerColor) - 1, 1);

    var R = binVal.substring(0, bitsPerColor);
    var G = binVal.substring(bitsPerColor, bitsPerColor * 2);
    var B = binVal.substring(bitsPerColor * 2, bitsPerColor * 3);

    console.debug("rgb=" + R + "," + G + "," + B);

    var Rval = parseInt((binToInt(R) / (maxRGBVal)) * 255);
    var Gval = parseInt((binToInt(G) / (maxRGBVal)) * 255);
    var Bval = parseInt((binToInt(B) / (maxRGBVal)) * 255);

    console.debug("rgbVals=" + Rval + "," + Gval + "," + Bval);

    return "rgb(" + Rval + "," + Gval + "," + Bval + ")";
  }
}

/**
 * Extract the given byte from the bitString.
 */
function readByte(bitString, byteNum) {
  return bitString.substring(byteNum * 8, byteNum * 8 + 8);
}

function binToInt(bits) {
  return (bits.length == 0) ? 0 : parseInt(bits, 2);
}

/**
 * Canvas needs an array of RGB colors to render image.  This function reads the given bit string, pulling off chunks
 * of size `bitsPerPixel` and making an RGB color out of it.
 */
function bitsToColors(bitString, bitsPerPixel) {
  var colorList = [];

  for (var i = 0; i < bitString.length; i += bitsPerPixel) {
    colorList.push(getColorVal2(bitString.substring(i, i + bitsPerPixel), bitsPerPixel));

  }
  if ((bitString.length / bitsPerPixel) != colorList.length) colorList.pop();

  return colorList;
}

function changeVal(elementID) {
  var val = -1;

  if (elementID == "width") {
    val = document.getElementById("widthRange").value;
  } else if (elementID = "bitsPerPixel") {
    val = document.getElementById("bitsPerPixelSlider").value;

    if (val == 0) {
      val = 1;
    }
  } else {
    val = document.getElementById("heightRange").value;
  }

  // Make textbox value match slider value.
  document.getElementById(elementID).value = val;

  updateBinaryDataToMatchSliders();
  formatBitDisplay();
  drawGraph();
}

function setSliders() {

  document.getElementById("heightRange").value = document.getElementById("height").value;
  document.getElementById("widthRange").value = document.getElementById("width").value;
  document.getElementById("bitsPerPixelSlider").value = document.getElementById("bitsPerPixel").value;

  updateBinaryDataToMatchSliders();
  formatBitDisplay();
  drawGraph();
}

function updateBinaryDataToMatchSliders() {

  var heightByte = pad(parseInt(document.getElementById("heightRange").value).toString(2), 8, "0");
  var widthByte = pad(parseInt(document.getElementById("widthRange").value).toString(2), 8, "0");
  var bppByte = pad(parseInt(document.getElementById("bitsPerPixelSlider").value).toString(2), 8, "0");


  var justBits = document.getElementById("binaryImage").value.replace(/[ \n]/g, "");
  var isHex = ("hex" == document.querySelector('input[name="binHex"]:checked').value);

  if (isHex) {
    justBits = hexToBinPvt(justBits);
  }

  var newBits = widthByte + heightByte + bppByte;
  if (justBits.length > 24) {
    newBits += justBits.substring(24);
  }
  if (isHex) {
    newBits = binToHexPvt(newBits);
  }

  // Note: unformatted at this point.
  document.getElementById("binaryImage").value = newBits;

  formatBitDisplay();
}

/**
 * Creates a PNG the given canvas and opens it in a new window.  Image can be copy/pasted, saved, etc. from there.
 * @param canvasId the id of the canvas you want to make a PNG of.
 */
function showPNG(canvasId) {

  var canvas = document.getElementById(canvasId);
  var w = window.open(canvas.toDataURL(), canvasId,
      "width=" + canvas.width + ", height=" + canvas.height + ", left=100, menubar=0, titlebar=0, scrollbars=0");
  w.focus();
}

function saveBitsWindow(bitText) {

  var myWindow = window.open("", "Bits", "width=200, height=200");
  myWindow.document.write("<p>Below are the bits you entered to create an image."
      + "<br>You can copy/paste them from here to some other place for safe keeping."
      + "<br>NOTE: you will lose this data once you close this window.</p><hr>"
      + "<pre width=60>" + bitText + "</pre>");
  myWindow.focus();
  myWindow.resizeBy(300, 300);
}

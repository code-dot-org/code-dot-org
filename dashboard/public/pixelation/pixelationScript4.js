/**
 * Pixelation widget for visualizing image encoding.
 *
 * Original code written by Baker Franke.
 */

var MAX_SIZE = 400;

var pixel_data = document.querySelector("#pixel_data");
var canvas = document.querySelector("#canvas");

function drawGraph() {
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, MAX_SIZE, MAX_SIZE);

  var binCode = "";

  // If the hex radio button is currently selected.
  if (document.getElementsByName("binHex")[1].checked) {
    // Then we need to get the binary representation for this function to work.
    // The text area should preserve line breaks, spaces, and hex digits.
    pixel_data.value = pixel_data.value.replace(/[^0-9A-F \n]/gi, "");

    // Binary code needs to have everything stripped and converted.
    binCode = hexToBinPvt(pixel_data.value.replace(/[^0-9A-F]/gi, ""));
  } else {
    // Otherwise take the straight binary from the text input.
    // The text area should preserve line breaks, spaces, 0s, and 1s.
    pixel_data.value = pixel_data.value.replace(/[^01 \n]/gi, "");

    // Binary code needs to have everything stripped except for 0s and 1s.
    binCode = pixel_data.value.replace(/[^01]/gi, "");
  }

  // Read width, height out of the bit string (where width is given in byte 0, height in byte 1).
  var w = binToInt(readByte(binCode, 0));
  var h = binToInt(readByte(binCode, 1));
  document.getElementById("width").value = document.getElementById("widthRange").value = w;
  document.getElementById("height").value = document.getElementById("heightRange").value = h;

  var bitsPerPix = binToInt(readByte(binCode, 2));

  document.getElementById("bitsPerPixel").value = bitsPerPix;
  document.getElementById("bitsPerPixelSlider").value = bitsPerPix;

  var imgBitString = binCode.substring(24, binCode.length);
  var colorNums = bitsToColors(imgBitString, bitsPerPix);

  var sqSize = MAX_SIZE / Math.max(w, h);
  var fillSize = sqSize * 0.95;
  var offset = (sqSize - fillSize) / 2;
  if (sqSize - fillSize < 0.33) {
    fillSize += 1;
    offset = 0;
  }

  var left = (MAX_SIZE - w * sqSize) / 2;
  var top = (MAX_SIZE - h * sqSize) / 2;
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      ctx.fillStyle = colorNums[(y * w) + x] || "#fdd";
      ctx.fillRect(left + x * sqSize + offset, top + y * sqSize + offset, fillSize, fillSize);
    }
  }
}

function formatBitDisplay() {

  var theData = pixel_data.value;
  var chunksPerLine = parseInt(document.getElementById("width").value);
  var chunkSize = parseInt(document.getElementById("bitsPerPixel").value);

  // If in binary mode.
  var newBits = formatBits(theData, chunkSize, chunksPerLine);
  if (newBits != null) {
    pixel_data.value = newBits;
  }
}

function unformatBits() {
  pixel_data.value = pixel_data.value.replace(/[ \n]/g, "");
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
  var allHexDigits = pixel_data.value.replace(/[^0-9A-F]/gi, "");
  console.debug("about to convert HEX2BIN and write to text area");
  pixel_data.value = hexToBinPvt(allHexDigits);
  formatBitDisplay();
}

function pad(str, len, prefix) {

  while (str.length < len) {
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

  var allBits = pixel_data.value.replace(/[^01]/gi, "");
  console.debug("about to convert BIN2HEX and write to text area");

  pixel_data.value = binToHexPvt(allBits);
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
  return bitString.substr(byteNum * 8, 8);
}

function binToInt(bits) {
  return parseInt(bits, 2) || 0;
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


  var justBits = pixel_data.value.replace(/[ \n]/g, "");
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
  pixel_data.value = newBits;

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

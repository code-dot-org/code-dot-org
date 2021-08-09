/* global $ appOptions dashboard options */
// This file does not pass eslint.
/* eslint-disable */

/**
 * Pixelation widget for visualizing image encoding.
 *
 * Original code written by Baker Franke.
 */

var MAX_SIZE = 400;

var pixel_format,
  pixel_data,
  canvas,
  main_ctx,
  widthText,
  widthRange,
  heightText,
  heightRange,
  bitsPerPixelText,
  bitsPerPixelRange,
  image_w,
  image_h,
  sqSize;

function pixelationInit() {
  pixel_format = document.querySelector("#pixel_format");
  pixel_data = document.querySelector("#pixel_data");
  canvas = document.querySelector("#canvas");
  main_ctx = canvas.getContext("2d");

  widthText = document.getElementById("width");
  widthRange = document.getElementById("widthRange");
  heightText = document.getElementById("height");
  heightRange = document.getElementById("heightRange");
  bitsPerPixelText = document.getElementById("bitsPerPixel");
  bitsPerPixelRange = document.getElementById("bitsPerPixelSlider");
  startOver = document.getElementById("start_over");

  if (appOptions.readonlyWorkspace) {
    // Disable the parts of the UI that would modify the pixelation data.

    pixel_data.setAttribute("readonly", "true");

    widthText.setAttribute("disabled", "true");
    widthRange.setAttribute("disabled", "true");
    heightText.setAttribute("disabled", "true");
    heightRange.setAttribute("disabled", "true");
    bitsPerPixelText.setAttribute("disabled", "true");
    bitsPerPixelRange.setAttribute("disabled", "true");
    startOver.setAttribute("disabled", "true");
  }

  customizeStyles();
  initProjects();
}

function customizeStyles() {
  if (!window.options) {
    // Default is version 3 (all features enabled).
    window.options = {
      version: "3",
      hideEncodingControls: false,
      v1HideSliders: false
    };
  }
  if (options.version === "1") {
    $(".hide_on_v1").hide();

    // Default initial width and height (only available to widget v1)
    var initialWidth = parseInt(options.v1InitialWidth, 10);
    var initialHeight = parseInt(options.v1InitialHeight, 10);
    if (!isNaN(initialWidth)) {
      $("#width").val(initialWidth);
    }
    if (!isNaN(initialHeight)) {
      $("#height").val(initialHeight);
    }

    // Hide sliders option (only available to widget v1)
    if (isHideSlidersLevel()) {
      $("#heightRange, #widthRange").hide();
      $("#height, #width").prop("readonly", true);
    }

    // The layout is fundamentally different in version 1 than it is in other versions.
    // Rearrange the DOM so that the visualization column sits at the top left.
    var visualizationColumn = document.getElementById("visualizationColumn");
    var visualizationEditorHeader = document.getElementById(
      "visualizationEditorHeader"
    );
    visualizationColumn.parentNode.insertBefore(
      visualizationColumn,
      visualizationEditorHeader
    );
  } else if (options.version === "2") {
    $(".hide_on_v2").hide();
    $("#height, #width").prop("readonly", true);
  }
  if (isHexLevel()) {
    $('input[name="binHex"][value="hex"]').prop("checked", true);
  }
  if (
    options.hideEncodingControls === true ||
    options.hideEncodingControls === "true"
  ) {
    $(".encoding_controls").hide();
  }
  if (options.shortInstructions) {
    $("#below_viz_instructions")
      .text(options.shortInstructions)
      .show();
  }
}

function initProjects() {
  // Initialize projects for save/load functionality if channel id is present.
  if (appOptions.channel) {
    if (!window.dashboard) {
      throw new Error("Assume existence of window.dashboard");
    }

    var sourceHandler = {
      setMakerAPIsEnabled: function(_) {},
      getMakerAPIsEnabled: function() {
        return false;
      },
      setSelectedSong: function() {},
      getSelectedSong: function() {
        return false;
      },
      setInitialLevelHtml: function(levelHtml) {},
      getLevelHtml: function() {
        return "";
      },
      setInitialAnimationList: function() {},
      getAnimationList: function(callback) {
        callback({});
      },
      setInitialGeneratedProperties: function(_) {},
      getGeneratedProperties: function() {
        return undefined;
      },
      setInitialLibrariesList: function(_) {},
      getLibrariesList: function() {
        return undefined;
      },
      setInitialLevelSource: function(levelSource) {
        options.projectData = levelSource;
      },
      getLevelSource: function() {
        return {
          // This method is expected to return a Promise. Since this file does not go through our
          // pipeline and can't be ES6, return a "then" method with a Promise-like interface
          // that returns a "catch" method.
          then: function(callback) {
            var studentCode = '';
            // Store the source in whichever format the level specifies.
            if (isHexSelected()) {
              var hexCode = pixel_data.value.replace(/[^0-9A-F]/gi, "");
              studentCode = isHexLevel() ? hexCode : hexToBinPvt(hexCode);
            } else {
              var binCode = pixel_data.value.replace(/[^01]/gi, "");
              studentCode = isHexLevel() ? binToHexPvt(binCode) : binCode;
            }

            var charactersToTrim = 0;
            if (options.version === "2") {
              // length & width
              charactersToTrim = 2;
            } else if (options.version === "3") {
              // length & width & bitsPerPixel
              charactersToTrim = 3;
            }

            charactersToTrim = isHexLevel() ? charactersToTrim * 2 : charactersToTrim * 8;
            studentCode = studentCode.substring(charactersToTrim, studentCode.length);
            studentCode = JSON.stringify({
              width: widthText.value,
              height: heightText.value,
              bitsPerPixel: bitsPerPixelText.value,
              binaryCode: studentCode
            });

            callback(studentCode);

            return {
              catch: function() {}
            }
          }
        };
      },
      prepareForRemix: function() {
        return {
          // this method is expected to return a Promise. Since this file does not go through our
          // pipeline and can't be ES6, return a "then" method with a Promise-like interface
          then: function(callback) {
            callback();
          }
        };
      }
    };
    dashboard.project
      .load()
      .then(function() {
        // Only enable saving if the initial load succeeds. This ensures that
        // any previous work will not be erased if the initial load fails.
        options.saveProject = dashboard.project.save.bind(dashboard.project);
        options.projectChanged = dashboard.project.projectChanged;
        window.dashboard.project.init(sourceHandler);

        // Complete project initialization sequence.
        $(document).trigger("appInitialized");

        // Only enable UI controls if the initial load succeeds. This ensures
        // the user cannot create any work which we are then unable to save if
        // the initial load fails.
        enableUiControls();
        loadMetadata();
        pixelationDisplay();
      })
      .catch(function() {
        window.alert(
          "the pixelation level failed to load. Please reload the page to try again."
        );
      });
  } else {
    pixelationDisplay();
  }
}

/**
 * Load the project's width and height and bitsPerPixel into the pixelation
 * widget and (if this is a version 2 or 3 project) prepend them into the code
 * too.
*/
function loadMetadata() {
  // First check if this is a legacy (pre 2020) project. Legacy projects do not
  // have the height & width & bitsPerPixel stored, they only have the binary
  // code stored as a string. If this is a legacy project, do nothing. It will
  // be migrated when it is saved.
  try {
    var projectData = options.projectData && JSON.parse(options.projectData);
  } catch (e) {
    return;
  }

  if (typeof projectData !== "object") {
    return;
  }

  // This is a newer project. Get the width & height & bitsPerPixel.
  widthText.value = widthRange.value = projectData.width;
  heightText.value = heightRange.value = projectData.height;
  if (projectData.bitsPerPixel) {
    // Only V3 projects have bitsPerPixel.
    bitsPerPixelText.value = bitsPerPixelRange.value = projectData.bitsPerPixel;
  }

  var sliderBytes = "";
  if (options.version !== "1") {
    sliderBytes = getSliderBytes();
    if (isHexLevel()) {
      sliderBytes = binToHexPvt(sliderBytes);
    }
  }

  pixel_data.value = sliderBytes + projectData.binaryCode;
}

function pixelationDisplay() {
  pixel_data.value = pixel_data.value || options.projectData || options.data;
  drawGraph(null, false, true);
  formatBitDisplay();
}

function isHexSelected() {
  return "hex" == document.querySelector('input[name="binHex"]:checked').value;
}

function isHexLevel() {
  return options.hex === true || options.hex === "true";
}

function isHideSlidersLevel() {
  if (parseInt(options.version, 10) === 1) {
    return options.v1HideSliders === true || options.v1HideSliders === "true";
  } else if (parseInt(options.version, 10) === 2) {
    return true;
  }
  return false;
}

function drawGraph(ctx, exportImage, updateControls) {
  ctx = ctx || main_ctx;
  ctx.fillStyle = "#ccc";
  ctx.fillRect(0, 0, MAX_SIZE, MAX_SIZE);

  var binCode = "";
  var hexMode = isHexSelected();

  // Save the cursor position before doing any manipulation of the textarea.
  var cursorPosition = pixel_data.selectionStart;
  var characterCount = pixel_data.value.length;

  // If the hex radio button is currently selected.
  if (hexMode) {
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

  // Restore cursor position. This may steal the focus from other controls,
  // so only do it if we know they should be updated.
  if (updateControls) {
    cursorPosition += pixel_data.value.length - characterCount;
    pixel_data.setSelectionRange(cursorPosition, cursorPosition);
  }

  var bitsPerPix = 1;
  if (options.version === "1") {
    image_w = getPositiveValue(widthText);
    image_h = getPositiveValue(heightText);
  } else {
    // Read width, height out of the bit string (where width is given in byte 0, height in byte 1).
    image_w = binToInt(readByte(binCode, 0));
    image_h = binToInt(readByte(binCode, 1));
    if (updateControls) {
      widthText.value = widthRange.value = image_w;
      heightText.value = heightRange.value = image_h;
    }
    binCode = binCode.substring(16, binCode.length);

    if (options.version != "2") {
      bitsPerPix = binToInt(readByte(binCode, 0));
      if (updateControls) {
        bitsPerPixelText.value = bitsPerPix;
        bitsPerPixelRange.value = bitsPerPix;
      }
      binCode = binCode.substring(8, binCode.length);

      // Update pixel format indicator.
      var bitsPerPixel = getPositiveValue(bitsPerPixelText);
      if (hexMode && bitsPerPixel % 4 !== 0) {
        pixel_format.innerHTML =
          '<span class="unknown">' +
          pad("", Math.ceil(bitsPerPixel / 4), "-") +
          "</span>";
      } else {
        if (bitsPerPixel % 3 === 0) {
          var str;
          if (hexMode) {
            str = pad("", bitsPerPixel / 12, "F");
          } else {
            str = pad("", bitsPerPixel / 3, "1");
          }
          pixel_format.innerHTML =
            '<span class="r">' +
            str +
            "</span>" +
            '<span class="g">' +
            str +
            "</span>" +
            '<span class="b">' +
            str +
            "</span>";
        } else {
          if (hexMode) {
            pixel_format.innerHTML = pad("", bitsPerPixel / 4, "F");
          } else {
            pixel_format.innerHTML = pad("", bitsPerPixel, "1");
          }
        }
      }
    }

    // Don't trigger autosave when workspace is readonly.
    if (!appOptions.readonlyWorkspace && options.projectChanged) {
      options.projectChanged();
    }
  }

  var colorNums = bitsToColors(binCode, bitsPerPix);

  (sqSize = 1), (fillSize = 1), (offset = 0);
  if (!document.querySelector("input#actual_size:checked")) {
    // Auto-size pixel borders and edge offsets.
    sqSize = MAX_SIZE / Math.max(image_w, image_h);
    fillSize = sqSize * 0.95;
    offset = (sqSize - fillSize) / 2;
    if (sqSize - fillSize < 0.33) {
      fillSize += 1;
      offset = 0;
    }
  }

  // Draw image.
  var left = Math.floor((MAX_SIZE - image_w * sqSize) / 2);
  var top = Math.floor((MAX_SIZE - image_h * sqSize) / 2);
  if (exportImage) {
    left = top = 0;
  }
  for (var y = 0; y < image_h; y++) {
    for (var x = 0; x < image_w; x++) {
      ctx.fillStyle = colorNums[y * image_w + x] || "#fdd";
      ctx.fillRect(
        left + x * sqSize + offset,
        top + y * sqSize + offset,
        fillSize,
        fillSize
      );
    }
  }
}

function formatBitDisplay() {
  var theData = pixel_data.value;
  var chunksPerLine = getPositiveValue(widthText);
  var chunkSize = getPositiveValue(bitsPerPixelText);

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
  var formattedBits = "";

  if (options.version != "1") {
    // First break out first 2 bytes (width, height).
    if (isHexSelected()) {
      formattedBits += justBits.substr(0, 2) + "\n";
      formattedBits += justBits.substr(2, 2) + "\n";
      if (options.version == "3") {
        // Break out the next byte (bits per pixel)
        formattedBits += justBits.substr(4, 2) + "\n";
        justBits = justBits.substr(6);
      } else {
        justBits = justBits.substr(4);
      }
    } else {
      // Binary.
      formattedBits +=
        justBits.substr(0, 4) + " " + justBits.substr(4, 4) + "\n";
      formattedBits +=
        justBits.substr(8, 4) + " " + justBits.substr(12, 4) + "\n";
      if (options.version == "3") {
        formattedBits +=
          justBits.substr(16, 4) + " " + justBits.substr(20, 4) + "\n";
        justBits = justBits.substr(24);
      } else {
        justBits = justBits.substr(16);
      }
    }
  }

  if (isHexSelected()) {
    if (chunkSize % 4 !== 0) {
      // If in hex mode can't break stuff up that's not multiple of 4 bits.
      formattedBits += justBits;
      return formattedBits;
    }
    // Else every char is 4 bits in hex.
    chunkSize = chunkSize / 4;
  }

  // Add spaces to main pixel data section.
  for (
    var i = 0, lineChunkCount = 1;
    i < justBits.length;
    i += chunkSize, lineChunkCount++
  ) {
    formattedBits += justBits.substr(i, chunkSize) + " ";
    if (lineChunkCount === chunksPerLine) {
      formattedBits += "\n";
      lineChunkCount = 0;
    }
  }

  return formattedBits;
}

function hexToBin() {
  var allHexDigits = pixel_data.value.replace(/[^0-9A-F]/gi, "");
  pixel_data.value = hexToBinPvt(allHexDigits);
  formatBitDisplay();
}

/**
 * Add `prefix` to the beginning of the given string until it reaches the given length.
 */
function pad(str, len, prefix) {
  while (str.length < len) {
    str = prefix + str;
  }
  return str;
}

function hexToBinPvt(allHexDigits) {
  var binString = "";
  for (var i = 0; i < allHexDigits.length; i++) {
    binString += pad(
      parseInt(allHexDigits.substring(i, i + 1), 16).toString(2),
      4,
      "0"
    );
  }
  return binString;
}

function binToHexPvt(allBits) {
  // Ensure bit string is half-byte aligned
  while (allBits.length % 4 !== 0) {
    allBits += "0";
  }
  var hexString = "";
  // Work in chunks of 8.
  for (var i = 0; i < allBits.length; i += 4) {
    hexString += parseInt(allBits.substring(i, i + 4), 2)
      .toString(16)
      .toUpperCase();
  }
  return hexString;
}

function binToHex() {
  var allBits = pixel_data.value.replace(/[^01]/gi, "");

  pixel_data.value = binToHexPvt(allBits);
  formatBitDisplay();
}

/**
 * If bitsPerPixel is not divisible by 3, then treat binVal as greyscale value.  Can only do RGB when integer numbers
 * of bits.  Can be assigned to R, G, B.  Need bitsPerPixel to handle irregular length binVals, which should only happen
 * with jagged ends of bit strings.
 */
function getColorVal(binVal, bitsPerPixel) {
  // Assume binVal is size of bits per pixel.
  var numColors = Math.pow(2, bitsPerPixel);
  var bitsPerColor = parseInt(bitsPerPixel / 3);

  if (bitsPerColor * 3 != bitsPerPixel) {
    // Greyscale
    var val = (binToInt(binVal) / (numColors - 1)) * 255;
    val = parseInt(val);
    return "rgb(" + val + ", " + val + ", " + val + ")";
  } else {
    var maxRGBVal = Math.max(Math.pow(2, bitsPerColor) - 1, 1);

    var R = binVal.substring(0, bitsPerColor);
    var G = binVal.substring(bitsPerColor, bitsPerColor * 2);
    var B = binVal.substring(bitsPerColor * 2, bitsPerColor * 3);

    var Rval = parseInt((binToInt(R) / maxRGBVal) * 255);
    var Gval = parseInt((binToInt(G) / maxRGBVal) * 255);
    var Bval = parseInt((binToInt(B) / maxRGBVal) * 255);

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
  if (!bitsPerPixel) {
    return colorList;
  }

  for (var i = 0; i < bitString.length; i += bitsPerPixel) {
    colorList.push(
      getColorVal(bitString.substring(i, i + bitsPerPixel), bitsPerPixel)
    );
  }
  if (bitString.length / bitsPerPixel != colorList.length) {
    colorList.pop();
  }

  return colorList;
}

function changeVal(elementID) {
  var val = -1;

  if (elementID == "width") {
    val = widthRange.value;
  } else if (elementID == "bitsPerPixel") {
    val = bitsPerPixelRange.value;

    if (val == 0) {
      val = 1;
    }
  } else {
    val = heightRange.value;
  }

  // Make textbox value match slider value.
  document.getElementById(elementID).value = val;

  if (options.version != "1") {
    updateBinaryDataToMatchSliders();
    formatBitDisplay();
  }
  setMinTextValues();
  drawGraph();
}

function setSliders() {
  // Make sure slider value is at least 1
  heightRange.value = getPositiveValue(heightText);
  widthRange.value = getPositiveValue(widthText);
  bitsPerPixelRange.value = getPositiveValue(bitsPerPixelText);

  if (options.version != "1") {
    updateBinaryDataToMatchSliders();
    formatBitDisplay();
  }
  drawGraph();
}

function setMinTextValues() {
  heightText.value = getPositiveValue(heightText);
  widthText.value = getPositiveValue(widthText);
  bitsPerPixelText.value = getPositiveValue(bitsPerPixelText);
}

/**
 * @param element {Element}
 * @returns element's numerical value if it represents a positive integer,
 * or 1 if it is non-positive or non-numerical.
 */
function getPositiveValue(element) {
  var value = parseInt(element.value, 10);
  return value >= 1 ? value : 1;
}

/**
 * Gets the numbers stored in the slider and returns them as a byte string.
 */
function getSliderBytes() {
  var heightByte = pad(getPositiveValue(heightRange).toString(2), 8, "0");
  var widthByte = pad(getPositiveValue(widthRange).toString(2), 8, "0");
  var bitsPerPixelByte = pad(getPositiveValue(bitsPerPixelRange).toString(2), 8, "0");

  var sliderBits = widthByte + heightByte;
  if (options.version === "3") {
    sliderBits += bitsPerPixelByte;
  }

  return sliderBits;
}

function updateBinaryDataToMatchSliders() {
  var newBits = getSliderBytes();
  var justBits = pixel_data.value.replace(/[ \n]/g, "");
  if (isHexSelected()) {
    justBits = hexToBinPvt(justBits);
  }

  if (options.version === "3") {
    if (justBits.length > 24) {
      newBits += justBits.substring(24);
    }
  } else {
    if (justBits.length > 16) {
      newBits += justBits.substring(16);
    }
  }
  if (isHexSelected()) {
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
function showPNG() {
  var tempCanvas = document.createElement("canvas");
  if (document.querySelector("input#actual_size:checked")) {
    tempCanvas.width = image_w;
    tempCanvas.height = image_h;
  } else {
    tempCanvas.width = image_w * sqSize;
    tempCanvas.height = image_h * sqSize;
  }
  drawGraph(tempCanvas.getContext("2d"), true);
  var w = window.open(
    "",
    "ShowImageWindow",
    "width=" +
      canvas.width +
      ", height=" +
      canvas.height +
      ", left=100, menubar=0, titlebar=0, scrollbars=0"
  );
  w.focus();
  w.document.write("<style>* { margin: 0; })</style>");
  w.document.write('<img src="' + tempCanvas.toDataURL() + '">');
  w.document.close();

  if (!appOptions.readonlyWorkspace && options.saveProject) {
    options.saveProject();
  }
}

var finishedButton;
function onFinishedButtonClick() {
  finishedButton = $("#finished");
  if (finishedButton.attr("disabled")) {
    return;
  }
  finishedButton.attr("disabled", true);

  if (!appOptions.readonlyWorkspace && options.saveProject) {
    options.saveProject().then(onSaveProjectComplete);
  } else {
    dashboard.widget.processResults(onComplete);
  }
}

function onSaveProjectComplete() {
  dashboard.widget.processResults(onComplete);
}

/**
 * Function to be called after processResults completes.
 * @param {Boolean} willRedirect Whether the browser will redirect to another
 *     location after this function completes.
 */
function onComplete(willRedirect) {
  if (!willRedirect) {
    finishedButton.attr("disabled", false);
  }
}

/**
 * Show a dialog prompting the user to confirm that they want to reset the
 * level to its initial state, losing any of their own work on that level.
 */
function startOverClicked() {
  dashboard.widget.showStartOverDialog(startOverConfirmed);
}

function startOverConfirmed() {
  pixel_data.value = options.data;
  drawGraph(null, false, true);
  formatBitDisplay();
}

var UI_CONTROL_IDS = [
  "width",
  "widthRange",
  "height",
  "heightRange",
  "bitsPerPixel",
  "bitsPerPixelSlider",
  "hex_to_bin",
  "bin_to_hex",
  "actual_size",
  "save_image",
  "pixel_data",
  "readable_format",
  "raw_format",
  "start_over",
  "finished"
];

function enableUiControls() {
  UI_CONTROL_IDS.forEach(function(id) {
    var el = document.getElementById(id);
    el.removeAttribute("disabled");
  });
}

pixelationInit();

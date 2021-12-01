/* Curious about this temporary code?  There's more detail at
 * https://github.com/code-dot-org/code-dot-org/pull/43679 */

var gridSize = 16;
var strokeWidth = 11;

var leftBarSvgId = "#left-bars-svg";
var rightBarSvgId = "#right-bars-svg";
var leftBarImgId = "#left-bars-img";
var rightBarImgId = "#right-bars-img";

var panelIds = [leftBarSvgId, rightBarSvgId];

// Start the sequence in the lull between animated cycles.
var step = 1;

// Randomize array in-place using Durstenfeld shuffle algorithm.
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

$(document).ready(function() {
  var barDefinitions = [];

  barDefinitions[0] = [];
  barDefinitions[1] = [];

  var cX, cY;
  var bookX, bookY;
  var calculatorX, calculatorY;
  var paintingX, paintingY;
  var plantX, plantY;
  var joinX, joinY;

  // Left panel.
  cX = 40;
  cY = 11;

  barDefinitions[0][0] = [
    {
      type: "line",
      start: [cX, cY],
      end: [(cX -= 2), cY],
      color: rgbString(211, 140, 189)
    },
    {
      type: "arc",
      end: [(cX -= 1), (cY -= 1)],
      color: rgbString(249, 163, 76),
      direction: "left-up"
    },
    {
      type: "line",
      end: [cX, (cY -= 3)],
      color: rgbString(249, 163, 76)
    },
    {
      type: "arc",
      end: [(bookX = cX -= 1), (bookY = cY -= 1)],
      color: rgbString(249, 163, 76),
      direction: "up-left"
    },
    {
      type: "line",
      end: [(cX -= 7), cY],
      color: rgbString(249, 163, 76)
    },
    {
      type: "arc",
      end: [(cX -= 1), (cY -= 1)],
      color: rgbString(249, 163, 76),
      direction: "left-up"
    },
    {
      type: "line",
      end: [cX, 0],
      color: rgbString(249, 163, 76)
    }
  ];

  cX = 40;
  cY = 12;

  barDefinitions[0][1] = [
    {
      type: "line",
      start: [cX, cY],
      end: [(cX -= 8), cY],
      color: rgbString(205, 242, 140)
    },
    {
      type: "line",
      end: [(cX -= 11), cY],
      color: rgbString(100, 196, 169)
    },
    {
      type: "arc",
      end: [(cX -= 1), (cY += 1)],
      color: rgbString(100, 196, 169),
      direction: "left-down"
    },
    {
      type: "line",
      end: [cX, (cY += 4)],
      color: rgbString(60, 134, 199)
    },
    {
      type: "arc",
      end: [(cX += 1), (cY += 1)],
      color: rgbString(88, 108, 179),
      direction: "down-right"
    },
    {
      type: "line",
      end: [(cX += 8), cY],
      color: rgbString(88, 108, 179)
    },
    {
      type: "arc",
      end: [(cX += 1), (cY += 1)],
      color: rgbString(88, 108, 179),
      direction: "right-down"
    },
    {
      type: "line",
      end: [cX, (cY += 4)],
      color: rgbString(88, 108, 179)
    }
  ];

  cX = 40;
  cY = 13;

  barDefinitions[0][2] = [
    {
      type: "line",
      start: [cX, cY],
      end: [(cX -= 1), cY],
      color: rgbString(138, 84, 163)
    },
    {
      type: "arc",
      end: [(cX -= 1), (cY += 1)],
      color: rgbString(138, 84, 163),
      direction: "left-down"
    },
    {
      type: "line",
      end: [cX, (cY += 2)],
      color: rgbString(141, 127, 188)
    },
    {
      type: "arc",
      end: [(cX -= 1), (cY += 1)],
      color: rgbString(141, 127, 188),
      direction: "down-left"
    },
    {
      type: "line",
      end: [(cX -= 3), cY],
      color: rgbString(210, 138, 188)
    },
    {
      type: "arc",
      end: [(cX -= 1), (cY -= 1)],
      color: rgbString(210, 138, 188),
      direction: "left-up"
    },
    {
      type: "arc",
      end: [(calculatorX = cX -= 1), (calculatorY = cY -= 1)],
      color: rgbString(210, 138, 188),
      direction: "up-left"
    },
    {
      type: "line",
      end: [(cX -= 9), cY],
      color: rgbString(210, 138, 188)
    },
    {
      type: "arc",
      end: [(cX -= 1), (cY -= 1)],
      color: rgbString(210, 138, 188),
      direction: "left-up"
    },
    {
      type: "line",
      end: [cX, (cY -= 9)],
      color: rgbString(210, 138, 188)
    },
    {
      type: "arc",
      end: [(cX -= 1), (cY -= 1)],
      color: rgbString(232, 80, 155),
      direction: "up-left"
    },
    {
      type: "line",
      end: [(cX -= 27), cY],
      color: rgbString(232, 80, 155)
    },
    {
      type: "arc",
      end: [(cX -= 1), (cY -= 1)],
      color: rgbString(232, 80, 155),
      direction: "left-up"
    },
    {
      type: "line",
      end: [cX, (cY -= 2)],
      color: rgbString(232, 80, 155)
    },
    {
      type: "arc",
      end: [(cX -= 1), (cY -= 1)],
      color: rgbString(232, 80, 155),
      direction: "up-left"
    },
    {
      type: "line",
      end: [0, cY],
      color: rgbString(232, 80, 155)
    }
  ];

  cX = bookX - 3;
  cY = bookY;

  barDefinitions[0][3] = [
    {
      type: "line",
      start: [cX, cY],
      end: [cX, (cY += 1)],
      color: rgbString(139, 210, 243)
    },
    {
      type: "arc",
      end: [(cX -= 1), (cY += 1)],
      color: rgbString(139, 210, 243),
      direction: "down-left"
    },
    {
      type: "line",
      end: [(cX -= 24), cY],
      color: rgbString(139, 210, 243)
    },
    {
      type: "line",
      end: [(cX -= 18), cY],
      color: rgbString(139, 210, 243)
    },
    {
      type: "arc",
      end: [(cX -= 1), (cY += 1)],
      color: rgbString(96, 187, 214),
      direction: "left-down"
    },
    {
      type: "line",
      end: [cX, cY + 5],
      color: rgbString(96, 187, 214)
    },
    {
      type: "arc",
      end: [(cX -= 1), (cY -= 1)],
      color: rgbString(96, 187, 214),
      direction: "down-left"
    },
    {
      type: "line",
      end: [0, cY],
      color: rgbString(96, 187, 214)
    }
  ];

  // Right panel.
  cX = 0;
  cY = 10;

  barDefinitions[1][0] = [
    {
      type: "line",
      start: [cX, cY],
      end: [(cX += 3), cY],
      color: rgbString(144, 141, 201)
    },
    {
      type: "arc",
      end: [(cX += 1), (cY -= 1)],
      color: rgbString(144, 141, 201),
      direction: "right-up"
    },
    {
      type: "line",
      end: [cX, (cY -= 4)],
      color: rgbString(137, 83, 161)
    },
    {
      type: "arc",
      end: [(paintingX = cX += 1), (paintingY = cY -= 1)],
      color: rgbString(137, 83, 161),
      direction: "up-right"
    },
    {
      type: "line",
      end: [(cX += 7), cY],
      color: rgbString(137, 83, 161)
    },
    {
      type: "arc",
      end: [(cX += 1), (cY += 1)],
      color: rgbString(137, 83, 161),
      direction: "right-down"
    },
    {
      type: "line",
      end: [cX, (cY += 2)],
      color: rgbString(137, 83, 161)
    },
    {
      type: "arc",
      end: [(cX += 1), (cY += 1)],
      color: rgbString(137, 83, 161),
      direction: "down-right"
    },
    {
      type: "line",
      end: [(cX += 37), cY],
      color: rgbString(88, 108, 179)
    },
    {
      type: "arc",
      end: [(cX += 1), (cY -= 1)],
      color: rgbString(60, 134, 199),
      direction: "right-up"
    },
    {
      type: "arc",
      end: [(cX += 1), (cY -= 1)],
      color: rgbString(60, 134, 199),
      direction: "up-right"
    },
    {
      type: "line",
      end: [40, cY],
      color: rgbString(100, 196, 169)
    }
  ];

  cX = 0;
  cY = 11;

  barDefinitions[1][1] = [
    {
      type: "line",
      start: [cX, cY],
      end: [(cX += 9), cY],
      color: rgbString(60, 134, 199)
    },
    {
      type: "line",
      end: [(cX += 8), cY],
      color: rgbString(96, 187, 214)
    },
    {
      type: "arc",
      end: [(cX += 1), (cY -= 1)],
      color: rgbString(96, 187, 214),
      direction: "right-up"
    },
    {
      type: "line",
      end: [cX, (cY -= 5)],
      color: rgbString(96, 187, 214)
    },
    {
      type: "line",
      end: [cX, 0],
      color: rgbString(139, 210, 243)
    }
  ];

  cX = 0;
  cY = 12;

  barDefinitions[1][2] = [
    {
      type: "line",
      start: [cX, cY],
      end: [(cX += 2), cY],
      color: rgbString(249, 163, 76)
    },
    {
      type: "arc",
      end: [(cX += 1), (cY += 1)],
      color: rgbString(249, 163, 76),
      direction: "right-down"
    },
    {
      type: "arc",
      end: [(joinX = cX += 1), (joinY = cY += 1)],
      color: rgbString(249, 163, 76),
      direction: "down-right"
    },
    {
      type: "line",
      start: [cX, cY],
      end: [(cX += 16), cY],
      color: rgbString(210, 138, 188)
    },
    {
      type: "line",
      start: [cX, cY],
      end: [(cX += 13), cY],
      color: rgbString(210, 138, 188)
    },
    {
      type: "arc",
      end: [(cX += 1), (cY -= 1)],
      color: rgbString(210, 138, 188),
      direction: "right-up"
    },
    {
      type: "line",
      start: [cX, cY],
      end: [cX, (cY -= 1)],
      color: rgbString(210, 138, 188)
    },
    {
      type: "arc",
      end: [(cX += 1), (cY -= 1)],
      color: rgbString(210, 138, 188),
      direction: "up-right"
    },
    {
      type: "line",
      start: [cX, cY],
      end: [40, cY],
      color: rgbString(231, 83, 156)
    }
  ];

  cX = joinX + 2;
  cY = joinY;

  barDefinitions[1][3] = [
    {
      type: "line",
      start: [cX, cY],
      end: [cX, (cY += 2)],
      color: rgbString(100, 196, 169)
    },
    {
      type: "arc",
      end: [(plantX = cX += 1), (plantY = cY += 1)],
      color: rgbString(100, 196, 169),
      direction: "down-right"
    },
    {
      type: "line",
      end: [(cX += 9), cY],
      color: rgbString(137, 200, 119)
    },
    {
      type: "arc",
      end: [(cX += 1), (cY += 1)],
      color: rgbString(205, 242, 140),
      direction: "right-down"
    },
    {
      type: "line",
      end: [cX, (cY += 4)],
      color: rgbString(205, 242, 140)
    }
  ];

  // For each panel, shuffle the bars, then draw the initial content.
  var bars = [];
  for (var panel = 0; panel < barDefinitions.length; panel++) {
    bars[panel] = [];
    var panelRef = $(panelIds[panel])[0];
    shuffleArray(barDefinitions[panel]);
    for (var bar = 0; bar < barDefinitions[panel].length; bar++) {
      bars[panel][bar] = drawBar(panelRef, barDefinitions[panel][bar]);
    }
  }

  // draw the icons
  drawImage($(panelIds[0])[0], "writing", bookX + 1, bookY);
  drawImage($(panelIds[0])[0], "math", calculatorX - 2, calculatorY);
  drawImage($(panelIds[1])[0], "art", paintingX + 3, paintingY);
  drawImage($(panelIds[1])[0], "biology", plantX + 3, plantY);

  // Show the outer containers for the SVGs and the fades.
  $("#svgbars").css("display", "flex");
  $("#csc-fades").css("display", "flex");

  // Adjust the SVGs to have the correct size now, and make
  // sure to do it again if the window is resized.
  handleResize();
  $(window).resize(function() {
    handleResize();
  });

  // Hide the regular images and show the SVGs.
  $(leftBarImgId).animate({ opacity: 0 }, 1000);
  $(rightBarImgId).animate({ opacity: 0 }, 1000);
  $(leftBarSvgId).animate({ opacity: 1 }, 1000);
  $(rightBarSvgId).animate({ opacity: 1 }, 1000);

  // Start animating smoothly.
  setInterval(function() {
    for (var panel = 0; panel < barDefinitions.length; panel++) {
      for (var bar = 0; bar < barDefinitions[panel].length; bar++) {
        updateBar(barDefinitions[panel][bar], bars[panel][bar], bar, step);
      }
    }
    step += 0.02;
  }, 1000 / 60);
});

function handleResize() {
  handleResizePanel("#left-svg-bars", "#left-bars-svg");
  handleResizePanel("#right-svg-bars", "#right-bars-svg");
}

function handleResizePanel(parentId, panelIdSvg) {
  // We want the SVG to match the parent in height, though the SVG can be wider.
  var targetHeight = $(parentId).outerHeight();

  // This is the width/height of our SVGs.
  var aspectRatio = 640 / 332;

  // Match the parent's height.
  var height = targetHeight;

  // Set the appropriate width for the full SVG.
  var width = targetHeight * aspectRatio;

  $(panelIdSvg)
    .css({
      width: width,
      height: height
    })
    .show();
}

function drawImage(panelRef, iconName, x, y) {
  var obj = document.createElementNS("http://www.w3.org/2000/svg", "image");
  obj.setAttributeNS(null, "height", "50");
  obj.setAttributeNS(null, "width", "50");
  obj.setAttributeNS(
    null,
    "href",
    "/shared/images/hoc-csc-icon-" + iconName + ".png"
  );
  obj.setAttributeNS(null, "transform", "translate(-25,-25)");
  obj.setAttributeNS(null, "x", x * gridSize);
  obj.setAttributeNS(null, "y", y * gridSize);
  panelRef.appendChild(obj);
}

function updateBar(barDefinition, bar, barIndex, step) {
  for (var segment = 0; segment < barDefinition.length; segment++) {
    var offset;
    var phase = (step + barIndex + 0.1 * segment) % 8;
    if (phase > 0 && phase <= 1) {
      offset = 1 + phase;
    } else if (phase >= 7 && phase <= 8) {
      offset = 2 + phase - 7;
    } else {
      offset = 2;
    }

    var scaledOffset;

    if (bar[segment].element.head1 && bar[segment].element.head2) {
      scaledOffset = offset * bar[segment].element.head1.totalLength;

      // Improve performance by not adjsting the SVG if the value hasn't changed.
      if (scaledOffset !== bar[segment].offset) {
        bar[segment].element.head1.setAttributeNS(
          null,
          "stroke-dashoffset",
          scaledOffset
        );
        bar[segment].element.head2.setAttributeNS(
          null,
          "stroke-dashoffset",
          scaledOffset
        );

        bar[segment].offset = scaledOffset;
      }
    } else {
      scaledOffset = offset * bar[segment].element.totalLength;

      // Improve performance by not adjsting the SVG if the value hasn't changed.
      if (scaledOffset !== bar[segment].offset) {
        bar[segment].element.setAttributeNS(
          null,
          "stroke-dashoffset",
          scaledOffset
        );
        bar[segment].offset = scaledOffset;
      }
    }
  }
}

function drawBar(panelRef, barDefinition, startX, startY) {
  var result = [];

  var currentX, currentY;

  for (var segment = 0; segment < barDefinition.length; segment++) {
    var barDef = barDefinition[segment];
    if (segment === 0) {
      currentX = barDef.start[0];
      currentY = barDef.start[1];
    }
    var obj, len;

    if (barDef.type === "line") {
      obj = document.createElementNS("http://www.w3.org/2000/svg", "path");
      obj.setAttributeNS(null, "fill", "none");
      obj.setAttributeNS(null, "stroke", barDef.color);
      obj.setAttributeNS(null, "stroke-width", strokeWidth);
      obj.setAttributeNS(
        null,
        "d",
        "M" +
          currentX * gridSize +
          "," +
          currentY * gridSize +
          " L" +
          barDef.end[0] * gridSize +
          "," +
          barDef.end[1] * gridSize
      );
      obj.setAttributeNS(null, "stroke-linecap", "round");
      len = obj.getTotalLength();
      obj.setAttributeNS(null, "stroke-dasharray", len);
      obj.setAttributeNS(null, "stroke-dashoffset", len);
      obj.totalLength = len;

      panelRef.appendChild(obj);
    } else if (barDef.type === "arc") {
      var sweepValue;
      if (
        ["down-right", "up-left", "right-up", "left-down"].includes(
          barDef.direction
        )
      ) {
        sweepValue = "0";
      } else {
        sweepValue = "1";
      }
      obj = document.createElementNS("http://www.w3.org/2000/svg", "path");
      obj.setAttributeNS(null, "fill", "none");
      obj.setAttributeNS(null, "stroke", barDef.color);
      obj.setAttributeNS(null, "stroke-width", strokeWidth);
      obj.setAttributeNS(
        null,
        "d",
        "M" +
          currentX * gridSize +
          " " +
          currentY * gridSize +
          " A " +
          gridSize +
          " " +
          gridSize +
          ", 0, 0, " +
          sweepValue +
          ", " +
          barDef.end[0] * gridSize +
          " " +
          barDef.end[1] * gridSize
      );
      obj.setAttributeNS(null, "stroke-linecap", "round");
      len = obj.getTotalLength();
      obj.setAttributeNS(null, "stroke-dasharray", len);
      obj.setAttributeNS(null, "stroke-dashoffset", len);
      obj.totalLength = len;

      panelRef.appendChild(obj);
    } else if (barDef.type === "arrow") {
      var head1Offset, head2Offset;
      if (barDef.direction === "right") {
        head1Offset = [-10, 10];
        head2Offset = [-10, -10];
      } else if (barDef.direction === "down") {
        head1Offset = [-10, -10];
        head2Offset = [10, -10];
      } else if (barDef.direction === "left") {
        head1Offset = [10, 10];
        head2Offset = [10, -10];
      } else if (barDef.direction === "up") {
        head1Offset = [10, 10];
        head2Offset = [-10, 10];
      }

      obj = {};
      obj.head1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      obj.head1.setAttributeNS(null, "fill", "none");
      obj.head1.setAttributeNS(null, "stroke", barDef.color);
      obj.head1.setAttributeNS(null, "stroke-width", strokeWidth);
      obj.head1.setAttributeNS(
        null,
        "d",
        "M " +
          (currentX * gridSize + head1Offset[0]) +
          " " +
          (currentY * gridSize + head1Offset[1]) +
          " L" +
          currentX * gridSize +
          " " +
          currentY * gridSize
      );
      obj.head1.setAttributeNS(null, "stroke-linecap", "round");
      len = obj.head1.getTotalLength();
      obj.head1.setAttributeNS(null, "stroke-dasharray", len);
      obj.head1.setAttributeNS(null, "stroke-dashoffset", len);
      obj.head1.totalLength = len;

      obj.head2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      obj.head2.setAttributeNS(null, "fill", "none");
      obj.head2.setAttributeNS(null, "stroke", barDef.color);
      obj.head2.setAttributeNS(null, "stroke-width", strokeWidth);
      obj.head2.setAttributeNS(
        null,
        "d",
        "M " +
          (currentX * gridSize + head2Offset[0]) +
          " " +
          (currentY * gridSize + head2Offset[1]) +
          " L" +
          currentX * gridSize +
          " " +
          currentY * gridSize
      );
      obj.head2.setAttributeNS(null, "stroke-linecap", "round");
      len = obj.head2.getTotalLength();
      obj.head2.setAttributeNS(null, "stroke-dasharray", len);
      obj.head2.setAttributeNS(null, "stroke-dashoffset", len);
      obj.head2.totalLength = len;

      panelRef.appendChild(obj.head1);
      panelRef.appendChild(obj.head2);
    }

    if (barDef.type !== "arrow") {
      currentX = barDef.end[0];
      currentY = barDef.end[1];
    }

    // We save the offset here to cache the current value, and improve
    // performance by not changing the SVG if that value hasn't changed
    // since last time.
    result[segment] = { element: obj, offset: len };
  }

  return result;
}

// The definitions at the top of this file use RGB values for opacity 1.
// For SVG rendering, we draw the bars with opacity 0.8 so that we get the
// nice colour-mixing at the intersection points.  As well as generating
// the appropriate RGB string, this function maps the specified RGB to an
// RGB value which will render as the specified RGB would have with opacity
// 11, but with opacity 0.8.
function rgbString(r, g, b) {
  return (
    "rgba(" +
    Math.round((r - 255 + 255 * 0.8) / 0.8) +
    ", " +
    Math.round((g - 255 + 255 * 0.8) / 0.8) +
    ", " +
    Math.round((b - 255 + 255 * 0.8) / 0.8) +
    ", " +
    "0.8)"
  );
}

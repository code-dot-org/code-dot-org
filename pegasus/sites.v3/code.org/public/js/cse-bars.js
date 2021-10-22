/* Curious about this temporary code?  There's more detail at
 * https://github.com/code-dot-org/code-dot-org/pull/43037 */

var gridSize = 18;
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

  // Left panel.
  barDefinitions[0] = [
    [
      {
        type: "line",
        start: [10, 3],
        end: [5, 3],
        color: rgbString(135, 201, 115)
      },
      {
        type: "arc",
        end: [4, 4],
        color: rgbString(96, 197, 169),
        direction: "left-down"
      },
      {
        type: "arc",
        end: [3, 5],
        color: rgbString(136, 210, 245),
        direction: "down-left"
      },
      {
        type: "line",
        end: [0, 5],
        color: rgbString(136, 210, 245)
      },
      { type: "arrow", color: rgbString(92, 180, 228), direction: "left" }
    ],
    [
      {
        type: "line",
        start: [13, 7],
        end: [8, 7],
        color: rgbString(204, 244, 134)
      },
      { type: "arrow", color: rgbString(188, 212, 95), direction: "left" }
    ],
    [
      {
        type: "line",
        start: [13, 8],
        end: [12, 8],
        color: rgbString(138, 80, 163)
      },
      {
        type: "arc",
        end: [11, 9],
        color: rgbString(138, 80, 163),
        direction: "left-down"
      },
      {
        type: "line",
        end: [11, 11],
        color: rgbString(140, 124, 189)
      },
      {
        type: "arc",
        end: [10, 12],
        color: rgbString(138, 80, 163),
        direction: "down-left"
      },
      {
        type: "line",
        end: [8, 12],
        color: rgbString(211, 136, 189)
      },
      {
        type: "arc",
        end: [7, 11],
        color: rgbString(211, 136, 189),
        direction: "left-up"
      },
      {
        type: "arc",
        end: [6, 10],
        color: rgbString(211, 136, 189),
        direction: "up-left"
      },
      {
        type: "line",
        end: [3, 10],
        color: rgbString(211, 136, 189),
        direction: "up-left"
      },
      { type: "arrow", color: rgbString(0, 173, 160), direction: "left" }
    ],
    [
      {
        type: "arc",
        start: [9, 12],
        end: [8, 13],
        color: rgbString(138, 80, 163),
        direction: "down-left"
      },
      {
        type: "line",
        end: [5, 13],
        color: rgbString(138, 80, 163)
      },
      { type: "arrow", color: rgbString(234, 76, 155), direction: "left" }
    ],
    [
      {
        type: "line",
        start: [13, 5],
        end: [11, 5],
        color: rgbString(144, 140, 203)
      },
      {
        type: "arc",
        end: [10, 4],
        color: rgbString(234, 76, 155),
        direction: 'left-up"'
      },
      {
        type: "line",
        end: [10, 2],
        color: rgbString(234, 76, 155)
      },
      {
        type: "arc",
        end: [9, 1],
        color: rgbString(251, 164, 65),
        direction: "up-left"
      },
      {
        type: "line",
        end: [6, 1],
        color: rgbString(251, 164, 65)
      },
      { type: "arrow", color: rgbString(244, 137, 221), direction: "left" }
    ]
  ];

  // Right panel.
  barDefinitions[1] = [
    [
      {
        type: "line",
        start: [0, 6],
        end: [1, 6],
        color: rgbString(144, 140, 203)
      },
      {
        type: "arc",
        end: [2, 5],
        color: rgbString(144, 140, 203),
        direction: "right-up"
      },
      {
        type: "line",
        end: [2, 2],
        color: rgbString(138, 80, 163)
      },
      {
        type: "arc",
        end: [3, 1],
        color: rgbString(138, 80, 163),
        direction: "up-right"
      },
      {
        type: "line",
        end: [6, 1],
        color: rgbString(138, 80, 163)
      },

      { type: "arrow", color: rgbString(234, 76, 155), direction: "right" }
    ],
    [
      {
        type: "line",
        start: [0, 4],
        end: [3, 4],
        color: rgbString(87, 106, 181)
      },
      {
        type: "arc",
        end: [4, 5],
        color: rgbString(87, 106, 181),
        direction: "right-down"
      },
      {
        type: "arc",
        end: [5, 6],
        color: rgbString(56, 133, 201),
        direction: "down-right"
      },
      {
        type: "line",
        end: [11, 6],
        color: rgbString(56, 133, 201)
      },

      { type: "arrow", color: rgbString(88, 108, 179), direction: "right" }
    ],
    [
      {
        type: "line",
        start: [0, 7],
        end: [2, 7],
        color: rgbString(251, 164, 65)
      },
      {
        type: "arc",
        end: [3, 8],
        color: rgbString(251, 164, 65),
        direction: "right-down"
      },
      {
        type: "arc",
        end: [4, 9],
        color: rgbString(251, 164, 65),
        direction: "down-right"
      },
      {
        type: "line",
        end: [7, 9],
        color: rgbString(251, 164, 65)
      },
      { type: "arrow", color: rgbString(234, 76, 155), direction: "right" }
    ],
    [
      {
        type: "line",
        start: [5, 9],
        end: [5, 11],
        color: rgbString(92, 187, 216)
      },
      {
        type: "arc",
        end: [6, 12],
        color: rgbString(96, 197, 169),
        direction: "down-right"
      },
      {
        type: "line",
        end: [8, 12],
        color: rgbString(135, 201, 115)
      },
      { type: "arrow", color: rgbString(176, 214, 109), direction: "right" }
    ],
    [
      {
        type: "arc",
        start: [0, 9],
        end: [1, 10],
        color: rgbString(144, 140, 203),
        direction: "right-down"
      },
      {
        type: "line",
        start: [1, 10],
        end: [1, 12],
        color: rgbString(144, 140, 203),
        direction: "right-down"
      },
      {
        type: "arc",
        end: [2, 13],
        color: rgbString(144, 140, 203),
        direction: "down-right"
      },
      {
        type: "line",
        end: [5, 13],
        color: rgbString(144, 140, 203)
      },
      { type: "arrow", color: rgbString(0, 173, 160), direction: "right" }
    ]
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

  // Adjust the SVGs to have the correct locations & size now, and make
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
  handleResizePanel("#left-bars-img", "#left-bars-svg", true);
  handleResizePanel("#right-bars-img", "#right-bars-svg", false);
}

function handleResizePanel(panelIdImg, panelIdSvg, constrainToRight) {
  // We want the SVGs to match the divs (which show the regular images using
  // background-image) in location & size.
  var pos = $(panelIdImg).position();
  var targetWidth = $(panelIdImg).outerWidth();
  var targetHeight = $(panelIdImg).outerHeight();

  // This is the width/height of our SVGs.
  var aspectRatio = 1;

  // This is the width/height of the divs which show the regular images.
  var targetAspectRatio = targetWidth / targetHeight;

  var top, left, width, height;

  // Now, we essentially simulate `background-size: contain`, by determining
  // the maximum size and correct position of our SVG that will fit in the div which shows
  // the regular image.
  if (targetAspectRatio > aspectRatio) {
    // Constrain by height...
    height = targetHeight;
    width = targetHeight * aspectRatio;
    top = pos.top;
  } else {
    // Constrain by width, and vertically center...
    width = targetWidth;
    height = targetWidth / aspectRatio;
    top = pos.top + (targetHeight - height) / 2;
  }

  // As for horiontal positioning, we push the left panel to the right, and the right
  // panel to the left.
  if (constrainToRight) {
    left = targetWidth - width + pos.left;
  } else {
    left = pos.left;
  }

  // And now our SVG will sit directly on top of the div which shows the regular image.
  $(panelIdSvg)
    .css({
      position: "absolute",
      top: top + "px",
      left: left + "px",
      width: width,
      height: height
    })
    .show();
}

function updateBar(barDefinition, bar, barIndex, step) {
  for (var segment = 0; segment < barDefinition.length; segment++) {
    var offset;
    var phase = 8 - ((step + barIndex + 0.1 * segment) % 8);
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

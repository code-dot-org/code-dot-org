var gridSize = 30; // how many pixels is each grid spaced by
var strokeWidth = 12;
var lenTimes = 1;

var step = 0;

$(document).ready(function() {
  var barDefinitions = [
    [
      {
        type: "line",
        start: [3, 0],
        end: [3, 3],
        color: "rgba(92,187,216, 0.8)"
      },
      {
        type: "arc",
        end: [4, 4],
        color: "rgba(96,197,169, 0.8)",
        direction: "down-right"
      },
      { type: "line", end: [5, 4], color: "rgba(96,197,169, 0.8)" },
      { type: "line", end: [6, 4], color: "rgba(135,201,115, 0.8)" },
      { type: "arrow", color: "rgba(135,201,115, 0.8)", direction: "right" }
    ],
    [
      {
        type: "line",
        start: [4, 0],
        end: [4, 3],
        color: "rgba(68,91,162, 0.8)"
      },
      { type: "arrow", color: "rgba(244,137,221, 0.8)", direction: "down" }
    ],
    [
      {
        type: "line",
        start: [10, 0],
        end: [10, 5],
        color: "rgba(251,164,65, 0.8)"
      },
      {
        type: "arc",
        end: [9, 6],
        color: "rgba(324,76,155, 0.8)",
        direction: "down-left"
      },
      { type: "line", end: [7, 6], color: "rgba(324,76,155, 0.8)" },
      { type: "line", end: [6, 6], color: "rgba(324,76,155, 0.8)" },
      { type: "arrow", color: "rgba(0,173,160, 0.8)", direction: "left" }
    ],
    [
      {
        type: "arc",
        start: [3, 10],
        end: [4, 9],
        color: "rgba(255,128,128, 0.8)",
        direction: "up-right"
      },
      { type: "line", end: [6, 9], color: "rgba(0,128,128, 0.8)" },
      { type: "arrow", color: "rgba(128,0,128, 0.8)", direction: "right" }
    ],
    [
      {
        type: "arc",
        start: [10, 10],
        end: [9, 9],
        color: "rgba(255,128,255, 0.8)",
        direction: "up-left"
      },
      {
        type: "arc",
        end: [8, 8],
        color: "rgba(255,128,128, 0.8)",
        direction: "left-up"
      },
      { type: "line", end: [8, 5], color: "rgba(0,128,128, 0.8)" },
      { type: "arrow", color: "rgba(128,0,128, 0.8)", direction: "up" }
    ],

    [
      {
        type: "line",
        start: [33, 0],
        end: [33, 3],
        color: "rgba(92,187,216, 0.8)"
      },
      {
        type: "arc",
        end: [34, 4],
        color: "rgba(96,197,169, 0.8)",
        direction: "down-right"
      },
      { type: "line", end: [35, 4], color: "rgba(96,197,169, 0.8)" },
      { type: "line", end: [36, 4], color: "rgba(135,201,115, 0.8)" },
      { type: "arrow", color: "rgba(135,201,115, 0.8)", direction: "right" }
    ],
    [
      {
        type: "line",
        start: [34, 0],
        end: [34, 3],
        color: "rgba(68,91,162, 0.8)"
      },
      { type: "arrow", color: "rgba(244,137,221, 0.8)", direction: "down" }
    ],
    [
      {
        type: "line",
        start: [30, 0],
        end: [30, 5],
        color: "rgba(251,164,65, 0.8)"
      },
      {
        type: "arc",
        end: [29, 6],
        color: "rgba(324,76,155, 0.8)",
        direction: "down-left"
      },
      { type: "line", end: [27, 6], color: "rgba(324,76,155, 0.8)" },
      { type: "line", end: [26, 6], color: "rgba(324,76,155, 0.8)" },
      { type: "arrow", color: "rgba(0,173,160, 0.8)", direction: "left" }
    ],
    [
      {
        type: "arc",
        start: [33, 10],
        end: [34, 9],
        color: "rgba(255,128,128, 0.8)",
        direction: "up-right"
      },
      { type: "line", end: [36, 9], color: "rgba(0,128,128, 0.8)" },
      { type: "arrow", color: "rgba(128,0,128, 0.8)", direction: "right" }
    ],
    [
      {
        type: "arc",
        start: [30, 10],
        end: [29, 9],
        color: "rgba(255,128,255, 0.8)",
        direction: "up-left"
      },
      {
        type: "arc",
        end: [28, 8],
        color: "rgba(255,128,128, 0.8)",
        direction: "left-up"
      },
      { type: "line", end: [28, 5], color: "rgba(0,128,128, 0.8)" },
      { type: "arrow", color: "rgba(128,0,128, 0.8)", direction: "up" }
    ]
  ];

  var bars = [];
  for (var bar = 0; bar < barDefinitions.length; bar++) {
    bars[bar] = drawBar(barDefinitions[bar]);
  }

  setInterval(function() {
    for (var bar = 0; bar < barDefinitions.length; bar++) {
      updateBar(barDefinitions[bar], bars[bar], bar, step);
    }
    step += 0.02;
  }, 1000 / 60);
});

function updateBar(barDefinition, bar, barIndex, step) {
  //var offset = -(step - barIndex * 150); // 300-(step % 300);

  for (var segment = 0; segment < barDefinition.length; segment++) {
    //var offset = -(step - barIndex * 150 - segment * 40); // 300-(step % 300);

    var offset;
    var phase = (step + barIndex + 0.1 * segment) % 12;
    if (phase > 0 && phase <= 1) {
      offset = 1 + phase;
    } else if (phase >= 11 && phase <= 12) {
      offset = 2 + phase - 11;
    } else if (phase > 12) {
      offset = 1;
    } else {
      offset = 2;
    }

    //offset = 1;
    //console.log(phase, offset);

    var scaledOffset;

    var barDef = barDefinition[segment];
    if (barDef.type === "arrow") {
      scaledOffset = -offset * bar[segment].head1.totalLength;
      bar[segment].head1.setAttributeNS(
        null,
        "stroke-dashoffset",
        scaledOffset
      );
      bar[segment].head2.setAttributeNS(
        null,
        "stroke-dashoffset",
        scaledOffset
      );
    } else {
      // 300-600 appears.  -1 to -2 * totalLength
      // 600-900 disappears again.  -2 to -3 * totalLength.

      scaledOffset = -offset * bar[segment].totalLength;
      bar[segment].setAttributeNS(null, "stroke-dashoffset", scaledOffset);
    }
  }
}

function drawBar(barDefinition, startX, startY) {
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
          ",L" +
          barDef.end[0] * gridSize +
          "," +
          barDef.end[1] * gridSize
      );
      obj.setAttributeNS(null, "stroke-linecap", "round");
      len = obj.getTotalLength();
      obj.setAttributeNS(null, "stroke-dasharray", len * lenTimes);
      obj.setAttributeNS(null, "stroke-dashoffset", len * lenTimes);
      obj.totalLength = len;

      $("#bars")[0].appendChild(obj);
    } else if (barDef.type === "arc") {
      var sweepValue;
      if (barDef.direction === "down-right" || barDef.direction === "up-left") {
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
      obj.setAttributeNS(null, "stroke-dasharray", len * lenTimes);
      obj.setAttributeNS(null, "stroke-dashoffset", len * lenTimes);
      obj.totalLength = len;

      $("#bars")[0].appendChild(obj);
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
          currentX * gridSize +
          " " +
          currentY * gridSize +
          ",L" +
          (currentX * gridSize + head1Offset[0]) +
          " " +
          (currentY * gridSize + head1Offset[1])
      );
      obj.head1.setAttributeNS(null, "stroke-linecap", "round");
      len = obj.head1.getTotalLength();
      obj.head1.setAttributeNS(null, "stroke-dasharray", len * lenTimes);
      obj.head1.setAttributeNS(null, "stroke-dashoffset", len * lenTimes);
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
          currentX * gridSize +
          " " +
          currentY * gridSize +
          ",L" +
          (currentX * gridSize + head2Offset[0]) +
          " " +
          (currentY * gridSize + head2Offset[1])
      );
      obj.head2.setAttributeNS(null, "stroke-linecap", "round");
      len = obj.head2.getTotalLength();
      obj.head2.setAttributeNS(null, "stroke-dasharray", len * lenTimes);
      obj.head2.setAttributeNS(null, "stroke-dashoffset", len * lenTimes);
      obj.head2.totalLength = len;

      $("#bars")[0].appendChild(obj.head1);
      $("#bars")[0].appendChild(obj.head2);
    }

    if (barDef.type !== "arrow") {
      currentX = barDef.end[0];
      currentY = barDef.end[1];
    }

    result[segment] = obj;
  }

  return result;
}

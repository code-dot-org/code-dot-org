var gridSize = 18;
var strokeWidth = 11;

var step = 0;

$(document).ready(function() {
  var barDefinitions = [];

  barDefinitions[0] = [
    // Originallly right side, index 0.
    [
      {
        type: "arc",
        start: [17, 6],
        end: [18, 5],
        color: "rgba(144, 140, 203, 0.8)",
        direction: "right-up"
      },
      {
        type: "line",
        end: [18, 2],
        color: "rgba(138, 80, 163, 0.8)"
      },
      {
        type: "arc",
        end: [19, 1],
        color: "rgba(138, 80, 163, 0.8)",
        direction: "up-right"
      },
      {
        type: "line",
        end: [22, 1],
        color: "rgba(138, 80, 163, 0.8)"
      },

      { type: "arrow", color: "rgba(234, 76, 155, 0.8)", direction: "right" }
    ],
    // Originally right side, index 1.
    [
      {
        type: "line",
        start: [17, 4],
        end: [20, 4],
        color: "rgba(87, 106, 181, 0.8)"
      },
      {
        type: "arc",
        end: [21, 5],
        color: "rgba(87, 106, 181, 0.8)",
        direction: "right-down"
      },
      {
        type: "arc",
        end: [22, 6],
        color: "rgba(56, 133, 201, 0.8)",
        direction: "down-right"
      },
      {
        type: "line",
        end: [27, 6],
        color: "rgba(56, 133, 201, 0.8)"
      }
    ],
    // Originally right side, index 2.
    [
      {
        type: "line",
        start: [17, 7],
        end: [19, 7],
        color: "rgba(251, 164, 65, 0.8)"
      },
      {
        type: "arc",
        end: [20, 8],
        color: "rgba(251, 164, 65, 0.8)",
        direction: "right-down"
      },
      {
        type: "arc",
        end: [21, 9],
        color: "rgba(251, 164, 65, 0.8)",
        direction: "down-right"
      },
      {
        type: "line",
        end: [24, 9],
        color: "rgba(251, 164, 65, 0.8)"
      },
      { type: "arrow", color: "rgba(234, 76, 155, 0.8)", direction: "right" }
    ],
    // Originally right side, index 3.
    [
      {
        type: "line",
        start: [22, 9],
        end: [22, 11],
        color: "rgba(92, 187, 216, 0.8)"
      },
      {
        type: "arc",
        end: [23, 12],
        color: "rgba(96, 197, 169, 0.8)",
        direction: "down-right"
      },
      {
        type: "line",
        end: [25, 12],
        color: "rgba(135, 201, 115, 0.8)"
      },
      { type: "arrow", color: "rgba(176, 214, 109, 0.8)", direction: "right" }
    ],
    // Originally right side, index 4.
    [
      {
        type: "arc",
        start: [17, 9],
        end: [18, 10],
        color: "rgba(144, 140, 203, 0.8)",
        direction: "right-down"
      },
      {
        type: "line",
        start: [18, 10],
        end: [18, 12],
        color: "rgba(144, 140, 203, 0.8)",
        direction: "right-down"
      },
      {
        type: "arc",
        end: [19, 13],
        color: "rgba(144, 140, 203, 0.8)",
        direction: "down-right"
      },
      {
        type: "line",
        end: [22, 13],
        color: "rgba(144, 140, 203, 0.8)"
      },
      { type: "arrow", color: "rgba(0, 173, 160, 0.8)", direction: "right" }
    ],
    // Originally right side, index 5.
    [
      {
        type: "line",
        start: [10, 5],
        end: [9, 5],
        color: "rgba(144, 140, 203, 0.8)"
      },
      {
        type: "arc",
        end: [8, 4],
        color: "rgba(234, 76, 155, 0.8)",
        direction: 'left-up"'
      },
      {
        type: "line",
        start: [8, 4],
        end: [8, 2],
        color: "rgba(234, 76, 155, 0.8)"
      },
      {
        type: "arc",
        end: [7, 1],
        color: "rgba(251, 164, 65, 0.8)",
        direction: "up-left"
      },
      {
        type: "line",
        end: [4, 1],
        color: "rgba(251, 164, 65, 0.8)"
      },

      { type: "arrow", color: "rgba(244, 137, 221, 0.8)", direction: "left" }
    ],
    // Originally left side, index 6.
    [
      {
        type: "line",
        start: [8, 3],
        end: [3, 3],
        color: "rgba(135, 201, 115, 0.8)"
      },
      {
        type: "arc",
        end: [2, 4],
        color: "rgba(96, 197, 169, 0.8)",
        direction: "left-down"
      },
      {
        type: "arc",
        end: [1, 5],
        color: "rgba(136, 210, 245, 0.8)",
        direction: "down-left"
      },
      {
        type: "line",
        end: [0, 5],
        color: "rgba(136, 210, 245, 0.8)"
      }
    ],
    // Originally left side, index 7.
    [
      {
        type: "line",
        start: [10, 7],
        end: [6, 7],
        color: "rgba(204, 244, 134, 0.8)"
      },
      { type: "arrow", color: "rgba(188, 212, 95, 0.8)", direction: "left" }
    ],
    // Originally left side, index 8.
    [
      {
        type: "arc",
        start: [10, 8],
        end: [9, 9],
        color: "rgba(138, 80, 163, 0.8)",
        direction: "left-down"
      },
      {
        type: "line",
        end: [9, 11],
        color: "rgba(140, 124, 189, 0.8)"
      },
      {
        type: "arc",
        end: [8, 12],
        color: "rgba(138, 80, 163, 0.8)",
        direction: "down-left"
      },
      {
        type: "line",
        end: [6, 12],
        color: "rgba(211, 136, 189, 0.8)"
      },
      {
        type: "arc",
        end: [5, 11],
        color: "rgba(211, 136, 189, 0.8)",
        direction: "left-up"
      },
      {
        type: "arc",
        end: [4, 10],
        color: "rgba(211, 136, 189, 0.8)",
        direction: "up-left"
      },
      {
        type: "line",
        end: [1, 10],
        color: "rgba(211, 136, 189, 0.8)",
        direction: "up-left"
      },
      { type: "arrow", color: "rgba(0, 173, 160, 0.8)", direction: "left" }
    ],
    // Originally left side, index 9.
    [
      {
        type: "arc",
        start: [7, 12],
        end: [6, 13],
        color: "rgba(138, 80, 163, 0.8)",
        direction: "down-left"
      },
      {
        type: "line",
        end: [3, 13],
        color: "rgba(138, 80, 163, 0.8)"
      },
      { type: "arrow", color: "rgba(234, 76, 155, 0.8)", direction: "left" }
    ]
  ];

  var bars = [];
  for (var panel = 0; panel < barDefinitions.length; panel++) {
    bars[panel] = [];
    var panelRef = $(".bars")[panel];
    for (var bar = 0; bar < barDefinitions[panel].length; bar++) {
      bars[panel][bar] = drawBar(panelRef, barDefinitions[panel][bar]);
    }
  }

  setInterval(function() {
    for (var panel = 0; panel < barDefinitions.length; panel++) {
      for (var bar = 0; bar < barDefinitions[panel].length; bar++) {
        updateBar(barDefinitions[panel][bar], bars[panel][bar], bar, step);
      }
    }
    step += 0.02;
  }, 1000 / 60);
});

function updateBar(barDefinition, bar, barIndex, step) {
  for (var segment = 0; segment < barDefinition.length; segment++) {
    var offset;
    var phase = 12 - ((step + barIndex + 0.1 * segment) % 12);
    if (phase > 0 && phase <= 1) {
      offset = 1 + phase;
    } else if (phase >= 11 && phase <= 12) {
      offset = 2 + phase - 11;
    } else if (phase > 12) {
      offset = 1;
    } else {
      offset = 2;
    }

    var scaledOffset;

    if (bar[segment].head1 && bar[segment].head2) {
      scaledOffset = offset * bar[segment].head1.totalLength;
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
      scaledOffset = offset * bar[segment].totalLength;
      bar[segment].setAttributeNS(null, "stroke-dashoffset", scaledOffset);
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

    result[segment] = obj;
  }

  obj = document.createElementNS("http://www.w3.org/2000/svg", "image");
  obj.setAttributeNS(null, "height", "144");
  obj.setAttributeNS(null, "width", "144");
  obj.setAttributeNS(null, "href", "/images/hour-of-code-logo-halo.png");
  obj.setAttributeNS(null, "transform", "translate(-72,-72)");
  obj.setAttributeNS(null, "x", "50%");
  obj.setAttributeNS(null, "y", "50%");
  panelRef.appendChild(obj);

  return result;
}
